import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportTicket } from '../types';
import { INITIAL_SUPPORT_TICKETS } from '../data/storeData';

interface TicketContextType {
  tickets: SupportTicket[];
  addTicket: (data: {
    ign: string;
    contact?: string;
    category: string;
    subject?: string;
    message: string;
    screenshotUrl?: string;
    priority?: SupportTicket['priority'];
  }) => SupportTicket;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  updateTicketNote: (id: string, adminNote: string) => void;
  updateTicketPriority: (id: string, priority: SupportTicket['priority']) => void;
  deleteTicket: (id: string) => void;
  clearResolvedTickets: () => void;
  resetTicketsToDefault: () => void;
  openTicketsCount: number;
}

const TICKETS_STORAGE_KEY = 'wondermc_support_tickets_v1';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SUPPORT_TICKETS;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch tickets from database on load and keep synchronized
  const fetchTickets = () => {
    fetch('/api/state?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
          try {
            localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(data.tickets));
          } catch {}
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  };

  useEffect(() => {
    fetchTickets();

    const interval = setInterval(fetchTickets, 25000);

    const handleFocus = () => {
      if (!document.hidden) {
        fetchTickets();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Sync back to database and localStorage when tickets state updates, but only after loaded
  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }

    if (isLoaded) {
      const token = sessionStorage.getItem('wondermc_admin_auth_token') || '';
      fetch('/api/state', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tickets }),
      }).catch(() => {});
    }
  }, [tickets, isLoaded]);

  const addTicket = (data: {
    ign: string;
    contact?: string;
    category: string;
    subject?: string;
    message: string;
    screenshotUrl?: string;
    priority?: SupportTicket['priority'];
  }): SupportTicket => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}-${randomNum}`,
      ticketNumber: `TKT-${randomNum}`,
      ign: data.ign.trim(),
      contact: data.contact?.trim() || '',
      category: data.category,
      subject: data.subject?.trim() || `${data.category} inquiry`,
      message: data.message.trim(),
      screenshotUrl: data.screenshotUrl?.trim() || undefined,
      status: 'open',
      priority: data.priority || 'medium',
      createdAt: new Date().toISOString(),
      adminNote: '',
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const updateTicketNote = (id: string, adminNote: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, adminNote } : t))
    );
  };

  const updateTicketPriority = (id: string, priority: SupportTicket['priority']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority } : t))
    );
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const clearResolvedTickets = () => {
    setTickets((prev) => prev.filter((t) => t.status !== 'resolved' && t.status !== 'closed'));
  };

  const resetTicketsToDefault = () => {
    setTickets(INITIAL_SUPPORT_TICKETS);
  };

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  ).length;

  return (
    <TicketContext.Provider
      value={{
        tickets,
        addTicket,
        updateTicketStatus,
        updateTicketNote,
        updateTicketPriority,
        deleteTicket,
        clearResolvedTickets,
        resetTicketsToDefault,
        openTicketsCount,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
