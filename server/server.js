const express = require("express");
const cors = require("cors");
const db = require("./database/db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Support CRM API is running",
  });
});

app.post("/api/tickets", (req, res) => {
  const {
    customer_name,
    customer_email,
    subject,
    description,
  } = req.body;

  if (
    !customer_name ||
    !customer_email ||
    !subject ||
    !description
  ) {
    return res.status(400).json({
      error: "All ticket fields are required",
    });
  }

  const ticketId = `TKT-${Date.now()}`;
  const now = new Date().toISOString();

  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      ticket_id,
      customer_name,
      customer_email,
      subject,
      description,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTicket.run(
    ticketId,
    customer_name,
    customer_email,
    subject,
    description,
    "Open",
    now,
    now
  );

  res.status(201).json({
    message: "Ticket created successfully",
    ticket_id: ticketId,
  });
});

app.get("/api/tickets", (req, res) => {
  const { search = "", status = "" } = req.query;

  let query = `
    SELECT *
    FROM tickets
    WHERE 1 = 1
  `;

  const params = {};

  if (search.trim()) {
    query += `
      AND (
        customer_name LIKE @search
        OR customer_email LIKE @search
        OR ticket_id LIKE @search
        OR description LIKE @search
        OR subject LIKE @search
      )
    `;

    params.search = `%${search.trim()}%`;
  }

  if (status.trim()) {
    query += `
      AND status = @status
    `;

    params.status = status.trim();
  }

  query += `
    ORDER BY created_at DESC
  `;

  const tickets = db.prepare(query).all(params);

  res.json(tickets);
});

app.get("/api/tickets/:ticket_id", (req, res) => {
  const { ticket_id } = req.params;

  const ticket = db
    .prepare(`
      SELECT *
      FROM tickets
      WHERE ticket_id = ?
    `)
    .get(ticket_id);

  if (!ticket) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  const notes = db
    .prepare(`
      SELECT *
      FROM notes
      WHERE ticket_id = ?
      ORDER BY created_at DESC
    `)
    .all(ticket_id);

  res.json({
    ...ticket,
    notes,
  });
});

app.put("/api/tickets/:ticket_id", (req, res) => {
  const { ticket_id } = req.params;
  const {
    customer_name,
    customer_email,
    subject,
    description,
    status,
  } = req.body;

  const existingTicket = db
    .prepare(`
      SELECT *
      FROM tickets
      WHERE ticket_id = ?
    `)
    .get(ticket_id);

  if (!existingTicket) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  const updatedTicket = {
    customer_name: customer_name ?? existingTicket.customer_name,
    customer_email: customer_email ?? existingTicket.customer_email,
    subject: subject ?? existingTicket.subject,
    description: description ?? existingTicket.description,
    status: status ?? existingTicket.status,
  };

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tickets
    SET
      customer_name = ?,
      customer_email = ?,
      subject = ?,
      description = ?,
      status = ?,
      updated_at = ?
    WHERE ticket_id = ?
  `).run(
    updatedTicket.customer_name,
    updatedTicket.customer_email,
    updatedTicket.subject,
    updatedTicket.description,
    updatedTicket.status,
    now,
    ticket_id
  );

  res.json({
    message: "Ticket updated successfully",
  });
});

app.delete("/api/tickets/:ticket_id", (req, res) => {
  const { ticket_id } = req.params;

  const existingTicket = db
    .prepare(`
      SELECT ticket_id
      FROM tickets
      WHERE ticket_id = ?
    `)
    .get(ticket_id);

  if (!existingTicket) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  // Delete notes belonging to this ticket first
  db.prepare(`
    DELETE FROM notes
    WHERE ticket_id = ?
  `).run(ticket_id);

  // Delete the ticket
  db.prepare(`
    DELETE FROM tickets
    WHERE ticket_id = ?
  `).run(ticket_id);

  res.json({
    message: "Ticket deleted successfully",
  });
});

app.post("/api/tickets/:ticket_id/notes", (req, res) => {
  const { ticket_id } = req.params;
  const { note_text } = req.body;

  if (!note_text) {
    return res.status(400).json({
      error: "Note text is required",
    });
  }

  const ticket = db
    .prepare(`
      SELECT ticket_id
      FROM tickets
      WHERE ticket_id = ?
    `)
    .get(ticket_id);

  if (!ticket) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  const now = new Date().toISOString();

  const result = db
    .prepare(`
      INSERT INTO notes (
        ticket_id,
        note_text,
        created_at
      )
      VALUES (?, ?, ?)
    `)
    .run(ticket_id, note_text, now);

  res.status(201).json({
    message: "Note added successfully",
    note_id: result.lastInsertRowid,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});