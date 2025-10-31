import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'accumed',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Secure parameterized query - prevents SQL injection
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    // Secure parameterized query with proper typing
    const result = await pool.query(
      'SELECT * FROM patients WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients by status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lastName, firstName, dateOfBirth } = req.query;
    
    // Build dynamic query with parameterized values
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params: (string | undefined)[] = [];
    let paramIndex = 1;

    if (lastName) {
      query += ` AND last_name ILIKE $${paramIndex}`;
      params.push(`%${lastName}%`);
      paramIndex++;
    }

    if (firstName) {
      query += ` AND first_name ILIKE $${paramIndex}`;
      params.push(`%${firstName}%`);
      paramIndex++;
    }

    if (dateOfBirth) {
      query += ` AND date_of_birth = $${paramIndex}`;
      params.push(dateOfBirth as string);
      paramIndex++;
    }

    query += ' ORDER BY last_name, first_name';

    // Execute parameterized query - all user inputs are safely escaped
    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      patients: result.rows,
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, dateOfBirth, email, phone, address } = req.body;

    // Input validation
    if (!firstName || !lastName || !dateOfBirth) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Secure parameterized insert
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, date_of_birth, email, phone, address, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [firstName, lastName, dateOfBirth, email, phone, address, 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, status } = req.body;

    // Secure parameterized update
    const result = await pool.query(
      `UPDATE patients 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [firstName, lastName, email, phone, address, status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Secure parameterized delete
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
