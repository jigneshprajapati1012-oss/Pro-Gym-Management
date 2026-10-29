import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getEquipment = async (
  req: AuthRequest,
  res: Response
) => {
  const { search, category, status, condition } = req.query;

  let sql = `
    SELECT *
    FROM public.equipment
    WHERE 1=1
  `;

  const params: any[] = [];

  if (search) {
    sql += `
      AND (
        name ILIKE $${params.length + 1}
        OR category ILIKE $${params.length + 1}
        OR notes ILIKE $${params.length + 1}
      )
    `;

    const term = `%${search}%`;
    params.push(term);
  }

  if (category) {
    params.push(category);

    sql += ` AND category = $${params.length}`;
  }

  if (status) {
    params.push(status);

    sql += ` AND status = $${params.length}`;
  }

  if (condition) {
    params.push(condition);

    sql += ` AND "condition" = $${params.length}`;
  }

  sql += ` ORDER BY id DESC`;

  try {
    const equipmentResult = await pool.query(
      sql,
      params
    );

    const alertsResult = await pool.query(`
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN status = 'Needs Maintenance' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS needs_maintenance,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'Under Repair' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS under_repair

      FROM public.equipment
    `);

    res.json({
      equipment: equipmentResult.rows,
      alerts: alertsResult.rows[0]
    });

  } catch (error) {
    console.error('GET EQUIPMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch equipment.'
    });
  }
};

export const createEquipment = async (
  req: AuthRequest,
  res: Response
) => {
  const {
    name,
    category,
    quantity,
    purchase_date,
    condition,
    maintenance_date,
    status,
    notes
  } = req.body;

  if (!name || !category) {
    res.status(400).json({
      error: 'Equipment name and category are required.'
    });

    return;
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO public.equipment (
          name,
          category,
          quantity,
          purchase_date,
          "condition",
          maintenance_date,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        name,
        category,
        Number(quantity) || 1,
        purchase_date || null,
        condition || 'Good',
        maintenance_date || null,
        status || 'Working',
        notes || null
      ]
    );

    const equipment = result.rows[0];

    if (
      status === 'Needs Maintenance' ||
      status === 'Under Repair'
    ) {
      try {
        await pool.query(
          `
            INSERT INTO public.notifications (
              title,
              message,
              type,
              recipient_role
            )
            VALUES ($1, $2, $3, $4)
          `,
          [
            'Equipment Alert',
            `Equipment "${name}" is marked as ${status}.`,
            'maintenance',
            'OWNER'
          ]
        );
      } catch (notificationError) {
        console.error(
          'EQUIPMENT NOTIFICATION ERROR:',
          notificationError
        );
      }
    }

    res.status(201).json({
      message: 'Equipment added successfully',
      equipmentId: equipment.id,
      equipment
    });

  } catch (error) {
    console.error('CREATE EQUIPMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to add equipment.'
    });
  }
};

export const updateEquipment = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  const {
    name,
    category,
    quantity,
    purchase_date,
    condition,
    maintenance_date,
    status,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `
        UPDATE public.equipment
        SET
          name = $1,
          category = $2,
          quantity = $3,
          purchase_date = $4,
          "condition" = $5,
          maintenance_date = $6,
          status = $7,
          notes = $8
        WHERE id = $9
        RETURNING *
      `,
      [
        name,
        category,
        Number(quantity) || 1,
        purchase_date || null,
        condition || 'Good',
        maintenance_date || null,
        status || 'Working',
        notes || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Equipment not found.'
      });

      return;
    }

    res.json({
      message: 'Equipment updated successfully.',
      equipment: result.rows[0]
    });

  } catch (error) {
    console.error('UPDATE EQUIPMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to update equipment.'
    });
  }
};

export const deleteEquipment = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `
        DELETE FROM public.equipment
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Equipment not found.'
      });

      return;
    }

    res.json({
      message: 'Equipment deleted successfully.'
    });

  } catch (error) {
    console.error('DELETE EQUIPMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to delete equipment.'
    });
  }
};