"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: number;
  email: string;
}

interface BetOption {
  id: number;
  label: string;
  odds: number;
}

interface Event {
  id: number;
  sport: string;
  title: string;
  startTime: string;
  status: string;
  betOptions?: BetOption[];
}

export default function EventsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedSport, selectedStatus]);

  async function fetchUserData() {
    try {
      const userRes = await fetch("/api/user", {
        credentials: 'include'
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      setEventsLoading(true);
      let url = "/api/events";
      const params = new URLSearchParams();

      if (selectedSport) {
        params.append('sport', selectedSport);
      }
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const eventsRes = await fetch(url, {
        credentials: 'include'
      });

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setEventsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: 'include'
      });

      // Limpiar localStorage
      localStorage.removeItem('jwt-token');

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const sports = ['Fútbol', 'Baloncesto', 'Tenis', 'Béisbol'];
  const statuses = ['upcoming', 'live', 'finished'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Eventos Deportivos</h1>
            {user && (
              <p className="text-muted-foreground">
                Bienvenido, {user.email}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/history")}
              variant="outline"
            >
              Historial
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={selectedSport === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSport('')}
            >
              Todos los deportes
            </Button>
            {sports.map((sport) => (
              <Button
                key={sport}
                variant={selectedSport === sport ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSport(sport)}
              >
                {sport}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedStatus === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('')}
            >
              Todos los estados
            </Button>
            {statuses.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'upcoming' ? 'Próximos' :
                 status === 'live' ? 'En vivo' : 'Finalizados'}
              </Button>
            ))}
          </div>
        </div>

        {eventsLoading ? (
          <div className="text-center py-8">
            <p>Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No hay eventos disponibles{selectedSport ? ` para ${selectedSport}` : ''}{selectedStatus ? ` con estado ${selectedStatus}` : ''}.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Asegúrate de que tu backend de NestJS esté ejecutándose en el puerto 3000.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="capitalize">
                        {event.sport}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800' 
                        : event.status === 'live'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === 'upcoming' ? 'Próximo' :
                       event.status === 'live' ? 'En vivo' : 'Finalizado'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fecha: {formatDate(event.startTime)}
                  </p>

                  {event.betOptions && event.betOptions.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Opciones de apuesta:</p>
                      {event.betOptions.slice(0, 2).map((option) => (
                        <div key={option.id} className="flex justify-between items-center text-sm">
                          <span>{option.label}</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {option.odds}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => router.push(`/bets?eventId=${event.id}`)}
                    disabled={event.status !== 'upcoming'}
                  >
                    {event.status === 'upcoming' ? 'Apostar' : 'No disponible'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
