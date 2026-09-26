import { useEffect, useState } from "react";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateTicket = async () => {
    if (!customerName || !customerEmail || !subject || !description) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("https://support-crm-production-6214.up.railway.app/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          subject,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create ticket.");
        return;
      }

      setCustomerName("");
      setCustomerEmail("");
      setSubject("");
      setDescription("");
      setShowCreateForm(false);

      setSearch("");
      setStatus("");

      const ticketsResponse = await fetch(
        "https://support-crm-production-6214.up.railway.app/api/tickets"
      );

      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData);

      alert(`Ticket ${data.ticket_id} created successfully!`);
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Unable to create ticket.");
    }
  };

  const handleDeleteTicket = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this ticket? This action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `https://support-crm-production-6214.up.railway.app/api/tickets/${selectedTicket.ticket_id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to delete ticket.");
      return;
    }

    alert("Ticket deleted successfully.");

    setTickets((currentTickets) =>
      currentTickets.filter(
        (ticket) => ticket.ticket_id !== selectedTicket.ticket_id
      )
    );

    setSelectedTicket(null);
    setSelectedTicketId(null);
  } catch (error) {
    console.error("Error deleting ticket:", error);
    alert("Unable to delete ticket.");
  }
};

  useEffect(() => {
    setLoading(true);
    setError("");

    const url = `https://support-crm-production-6214.up.railway.app/api/tickets?search=${encodeURIComponent(
      search
    )}&status=${encodeURIComponent(status)}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
        setError("Unable to load tickets. Please check that the backend is running.");
        setLoading(false);
      });
  }, [search, status]);

  useEffect(() => {
    setDetailError("");
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    fetch(`https://support-crm-production-6214.up.railway.app/api/tickets/${selectedTicketId}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedTicket(data);
      })
      .catch((error) => {
        console.error("Error fetching ticket details:", error);
        setDetailError("Unable to load ticket details.");
      });
  }, [selectedTicketId]);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Support CRM
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Manage customer support tickets
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            + Create Ticket
          </button>
        </div>
      </header>

      <main className="w-full px-6 py-8">
        {selectedTicketId && (
          <div className="mb-8 rounded-xl bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                {/* ticketdetailed panel starts from hear */}
                <p className="text-sm font-medium text-slate-300">
                  Ticket Details
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {selectedTicketId}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicketId(null)}
                className="text-sm font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {detailError ? (
              <p className="mt-4 text-sm text-red-600">{detailError}</p>
            ) : selectedTicket ? (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Customer
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {selectedTicket.customer_name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {selectedTicket.customer_email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Subject
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedTicket.subject}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Description
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {selectedTicket.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Status
                  </p>
                  <select
                    value={selectedTicket.status}
                    onChange={(event) => {
                      setSelectedTicket({
                        ...selectedTicket,
                        status: event.target.value,
                      });
                    }}
                    className="mt-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `https://support-crm-production-6214.up.railway.app/api/tickets/${selectedTicket.ticket_id}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              status: selectedTicket.status,
                            }),
                          }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                          alert(data.error || "Failed to update ticket.");
                          return;
                        }

                        alert("Ticket status updated successfully.");

                        setTickets((currentTickets) =>
                          currentTickets.map((ticket) =>
                            ticket.ticket_id === selectedTicket.ticket_id
                              ? { ...ticket, status: selectedTicket.status }
                              : ticket
                          )
                        );
                      } catch (error) {
                        console.error("Error updating ticket:", error);
                        alert("Unable to update ticket.");
                      }
                    }}
                    className="mt-3 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:border-slate-500 hover:bg-slate-700"
                  >
                    Save Status
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTicket}
                    className="mt-3 ml-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:border-red-400 hover:bg-red-500/20"
                  >
                    Delete Ticket
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <h3 className="text-lg font-semibold text-white">
                    Notes
                  </h3>

                  {selectedTicket.notes && selectedTicket.notes.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {selectedTicket.notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-lg bg-slate-800 p-4"
                        >
                          <p className="text-sm text-slate-300">
                            {note.note_text}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      No notes yet.
                    </p>
                  )}

                  <textarea
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    placeholder="Add a note..."
                    rows="4"
                    className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    disabled={addingNote}
                    onClick={async () => {
                      if (!noteText.trim()) {
                        alert("Please enter a note.");
                        return;
                      }

                      try {
                        setAddingNote(true);

                        const response = await fetch(
                          `https://support-crm-production-6214.up.railway.app/api/tickets/${selectedTicket.ticket_id}/notes`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              note_text: noteText,
                            }),
                          }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                          alert(data.error || "Failed to add note.");
                          return;
                        }

                        const ticketResponse = await fetch(
                          `https://support-crm-production-6214.up.railway.app/api/tickets/${selectedTicket.ticket_id}`
                        );

                        const updatedTicket = await ticketResponse.json();

                        setSelectedTicket(updatedTicket);
                        setNoteText("");
                      } catch (error) {
                        console.error("Error adding note:", error);
                        alert("Unable to add note.");
                      } finally {
                        setAddingNote(false);
                      }
                    }}
                    className="mt-3 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:border-slate-500 hover:bg-slate-700 disabled:opacity-50"
                  >
                    {addingNote ? "Adding..." : "Add Note"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Loading ticket details...
              </p>
            )}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-8 rounded-xl bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Create Ticket
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Create a new customer support ticket
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Customer name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              />

              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="Customer email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              />

              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Issue title"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              />

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the issue..."
                rows="5"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={handleCreateTicket}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Ticket
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Tickets
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            All customer support tickets
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets..."
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-slate-500 sm:w-52"
            >
              <option value="">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          {/* Ticket Card starts hear */}
        </div>

        {loading ? (
          <div className="rounded-xl bg-slate-900 p-8 text-center shadow-sm">
            <p className="text-slate-400">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-slate-900 p-8 text-center shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl bg-slate-900 p-8 text-center shadow-sm">
            <p className="text-slate-400">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                onClick={() => setSelectedTicketId(ticket.ticket_id)}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {ticket.ticket_id}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
                      {ticket.subject}
                    </h3>

                    <p className="mt-1 text-sm text-slate-300">
                      {ticket.customer_name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {ticket.customer_email}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      ticket.status === "Open"
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30"
                        : ticket.status === "In Progress"
                        ? "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30"
                        : "bg-slate-700 text-slate-200 ring-1 ring-inset ring-slate-600"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-300">
                  {ticket.description}
                </p>

                <div className="mt-3 border-t border-slate-800 pt-3">
                  <p className="text-xs text-slate-500">
                    Created {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;