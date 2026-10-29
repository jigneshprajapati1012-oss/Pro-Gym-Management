import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  try {
    const todayStr = new Date().toISOString().split('T')[0];

    if (user.role === 'TRAINER') {
      const trainerId = user.trainerId || 0;

      const assignedMembersResult = await pool.query(
        `
          SELECT COUNT(*) AS count
          FROM public.members
          WHERE assigned_trainer_id = $1
        `,
        [trainerId]
      );

      const todayAttendanceResult = await pool.query(
        `
          SELECT COUNT(*) AS count
          FROM public.attendance a
          JOIN public.members m
            ON a.member_id = m.id
          WHERE m.assigned_trainer_id = $1
            AND a.date = $2
            AND a.status = 'Present'
        `,
        [trainerId, todayStr]
      );

      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 7);

      const expiringDateStr = expiringDate
        .toISOString()
        .split('T')[0];

      const expiringMembersResult = await pool.query(
        `
          SELECT COUNT(*) AS count
          FROM public.members
          WHERE assigned_trainer_id = $1
            AND expiry_date >= $2
            AND expiry_date <= $3
        `,
        [trainerId, todayStr, expiringDateStr]
      );

      res.json({
        role: 'TRAINER',
        assignedMembersCount: Number(
          assignedMembersResult.rows[0]?.count || 0
        ),
        todayAttendanceCount: Number(
          todayAttendanceResult.rows[0]?.count || 0
        ),
        expiringMembersCount: Number(
          expiringMembersResult.rows[0]?.count || 0
        )
      });

      return;
    }

    // OWNER Dashboard Full Analytics

    const totalMembersResult = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.members
    `);

    const activeMembersResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM public.members
        WHERE expiry_date >= $1
      `,
      [todayStr]
    );

    const expiredMembersResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM public.members
        WHERE expiry_date < $1
      `,
      [todayStr]
    );

    const todayAttendanceResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM public.attendance
        WHERE date = $1
          AND status = 'Present'
      `,
      [todayStr]
    );

    const currentMonthPrefix = todayStr.substring(0, 7);

    const monthlyRevenueResult = await pool.query(
      `
        SELECT COALESCE(SUM(amount), 0) AS sum
        FROM public.payments
        WHERE status = 'Completed'
          AND payment_date LIKE $1
      `,
      [`${currentMonthPrefix}%`]
    );

    const pendingPaymentsResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS sum
      FROM public.payments
      WHERE status = 'Pending'
    `);

    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 7);

    const expiringDateStr = expiringDate
      .toISOString()
      .split('T')[0];

    const expiringAlertsResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM public.members
        WHERE expiry_date >= $1
          AND expiry_date <= $2
      `,
      [todayStr, expiringDateStr]
    );

    // Chart 1: Revenue by month

    const revenueChartResult = await pool.query(`
      SELECT
        LEFT(payment_date, 7) AS month,
        COALESCE(SUM(amount), 0) AS revenue
      FROM public.payments
      WHERE status = 'Completed'
      GROUP BY LEFT(payment_date, 7)
      ORDER BY month DESC
      LIMIT 6
    `);

    const revenueChart = revenueChartResult.rows.reverse();

    // Chart 2: Membership distribution

    const membershipDistributionResult = await pool.query(`
      SELECT
        membership_type,
        COUNT(*) AS count
      FROM public.members
      GROUP BY membership_type
    `);

    // Chart 3: Attendance trend

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sevenDaysAgoStr = sevenDaysAgo
      .toISOString()
      .split('T')[0];

    const attendanceChartResult = await pool.query(
      `
        SELECT
          date,
          COUNT(
            CASE
              WHEN status = 'Present' THEN 1
            END
          ) AS present_count
        FROM public.attendance
        WHERE date >= $1
        GROUP BY date
        ORDER BY date ASC
      `,
      [sevenDaysAgoStr]
    );

    res.json({
      role: 'OWNER',

      stats: {
        totalMembers: Number(
          totalMembersResult.rows[0]?.count || 0
        ),

        activeMembers: Number(
          activeMembersResult.rows[0]?.count || 0
        ),

        expiredMembers: Number(
          expiredMembersResult.rows[0]?.count || 0
        ),

        todayAttendance: Number(
          todayAttendanceResult.rows[0]?.count || 0
        ),

        monthlyRevenue: Number(
          monthlyRevenueResult.rows[0]?.sum || 0
        ),

        pendingPayments: Number(
          pendingPaymentsResult.rows[0]?.sum || 0
        ),

        expiringCount: Number(
          expiringAlertsResult.rows[0]?.count || 0
        )
      },

      charts: {
        revenue: revenueChart,
        membershipDistribution:
          membershipDistributionResult.rows,
        attendance:
          attendanceChartResult.rows
      }
    });

  } catch (error) {
    console.error('GET DASHBOARD ANALYTICS ERROR:', error);

    res.status(500).json({
      error: 'Unable to load dashboard analytics.'
    });
  }
};


export const getFullReport = async (
  req: AuthRequest,
  res: Response
) => {
  const { type, date, from, to } = req.query;

  try {

    // ==============================
    // MEMBER REPORT
    // ==============================

    if (type === 'members') {
      const result = await pool.query(`
        SELECT
          m.full_name,
          m.email,
          m.phone,
          m.membership_type,
          m.start_date,
          m.expiry_date,
          m.payment_status,
          u.name AS trainer_name
        FROM public.members m
        LEFT JOIN public.trainers t
          ON m.assigned_trainer_id = t.id
        LEFT JOIN public.users u
          ON t.user_id = u.id
        ORDER BY m.registration_date DESC
      `);

      res.json({
        report: result.rows
      });

      return;
    }


    // ==============================
    // REVENUE REPORT
    // ==============================

    if (type === 'revenue') {
      const result = await pool.query(`
        SELECT
          p.transaction_id,
          m.full_name AS member_name,
          p.amount,
          p.payment_date,
          p.payment_method,
          p.membership_plan,
          p.status
        FROM public.payments p
        JOIN public.members m
          ON p.member_id = m.id
        ORDER BY p.payment_date DESC
      `);

      res.json({
        report: result.rows
      });

      return;
    }


    // ==============================
    // ATTENDANCE REPORT
    // ==============================

    if (type === 'attendance') {

      let attendanceQuery = `
        SELECT
          a.date,
          a.check_in_time,
          m.member_code,
          m.full_name AS member_name,
          a.status,
          u.name AS marked_by
        FROM public.attendance a
        JOIN public.members m
          ON a.member_id = m.id
        LEFT JOIN public.users u
          ON a.marked_by_user_id = u.id
      `;

      const params: string[] = [];

      if (date) {
        attendanceQuery += `
          WHERE a.date = $1
        `;

        params.push(String(date));

      } else if (from && to) {

        attendanceQuery += `
          WHERE a.date >= $1
            AND a.date <= $2
        `;

        params.push(String(from));
        params.push(String(to));

      } else if (from) {

        attendanceQuery += `
          WHERE a.date >= $1
        `;

        params.push(String(from));

      } else if (to) {

        attendanceQuery += `
          WHERE a.date <= $1
        `;

        params.push(String(to));
      }

      attendanceQuery += `
        ORDER BY a.date DESC, a.check_in_time DESC
      `;

      const result = await pool.query(
        attendanceQuery,
        params
      );

      // Summary counts

      let summaryQuery = `
        SELECT
          COUNT(*) FILTER (
            WHERE a.status = 'Present'
          ) AS present,

          COUNT(*) FILTER (
            WHERE a.status != 'Present'
          ) AS absent,

          COUNT(*) AS total_records

        FROM public.attendance a
      `;

      const summaryParams: string[] = [];

      if (date) {

        summaryQuery += `
          WHERE a.date = $1
        `;

        summaryParams.push(String(date));

      } else if (from && to) {

        summaryQuery += `
          WHERE a.date >= $1
            AND a.date <= $2
        `;

        summaryParams.push(String(from));
        summaryParams.push(String(to));

      } else if (from) {

        summaryQuery += `
          WHERE a.date >= $1
        `;

        summaryParams.push(String(from));

      } else if (to) {

        summaryQuery += `
          WHERE a.date <= $1
        `;

        summaryParams.push(String(to));
      }

      const summaryResult = await pool.query(
        summaryQuery,
        summaryParams
      );

      const summary = summaryResult.rows[0] || {};

      const present = Number(summary.present || 0);
      const absent = Number(summary.absent || 0);
      const totalRecords = Number(summary.total_records || 0);

      const attendanceRate =
        totalRecords > 0
          ? Number(((present / totalRecords) * 100).toFixed(1))
          : 0;

      res.json({
        report: result.rows,

        summary: {
          present,
          absent,
          totalRecords,
          attendanceRate
        }
      });

      return;
    }


    // ==============================
    // TRAINER REPORT
    // ==============================

    if (type === 'trainers') {
      const result = await pool.query(`
        SELECT
          u.name AS trainer_name,
          t.specialization,
          t.experience_years,
          t.phone,
          t.status,
          (
            SELECT COUNT(*)
            FROM public.members m
            WHERE m.assigned_trainer_id = t.id
          ) AS assigned_members
        FROM public.trainers t
        JOIN public.users u
          ON t.user_id = u.id
        ORDER BY u.name ASC
      `);

      res.json({
        report: result.rows
      });

      return;
    }

    res.status(400).json({
      error: 'Invalid report type requested.'
    });

  } catch (error) {
    console.error('GET FULL REPORT ERROR:', error);

    res.status(500).json({
      error: 'Unable to generate report.'
    });
  }
};