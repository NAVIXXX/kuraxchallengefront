"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Bet {
  id: number;
  amount: string;
  potentialWinnings: string;
  status: string;
  createdAt: string;
  event: {
    id: number;
    title: string;
    sport: string;
    startTime: string;
    status: string;
  };
  betOption: {
    id: number;
    label: string;
    odds: string;
  };
}

interface User {
  id: number;
  email: string;
}

export default function HistoryPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'user' | 'all'>('user');
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchUserBets();
  }, []);

  useEffect(() => {
    if (viewMode === 'user') {
      fetchUserBets();
    } else {
      fetchAllBets();
    }
  }, [viewMode]);

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
    }
  }

  async function fetchUserBets() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/bets?user=true", {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Error al obtener historial de apuestas");
      }

      const data = await res.json();
      setBets(data.bets || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar historial";
      setError(errorMessage);
      console.error("Error fetching user bets:", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllBets() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/bets", {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Error al obtener todas las apuestas");
      }

      const data = await res.json();
      setBets(data.bets || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar apuestas";
      setError(errorMessage);
      console.error("Error fetching all bets:", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: 'include'
      });

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

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'won':
        return 'Ganada';
      case 'lost':
        return 'Perdida';
      default:
        return status;
    }
  }

  function formatCurrency(amount: string | number) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {viewMode === 'user' ? 'Mi Historial de Apuestas' : 'Todas las Apuestas'}
            </h1>
            {user && (
              <p className="text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('user')}
              >
                Mis Apuestas
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
              >
                Todas las Apuestas
              </Button>
            </div>
            <Button
              onClick={() => router.push("/events")}
              variant="outline"
            >
              Eventos
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-red-500 text-center">{error}</p>
              <div className="text-center mt-4">
                <Button
                  onClick={viewMode === 'user' ? fetchUserBets : fetchAllBets}
                  variant="outline"
                  size="sm"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {bets.length === 0 && !error ? (
          <div className="text-center py-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  {viewMode === 'user'
                    ? 'No tienes apuestas registradas aún.'
                    : 'No hay apuestas registradas en el sistema.'}
                </p>
                <Button onClick={() => router.push("/events")}>
                  Ver Eventos Disponibles
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen */}
            {bets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resumen {viewMode === 'user' ? 'Personal' : 'General'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{bets.length}</p>
                      <p className="text-sm text-muted-foreground">Total Apuestas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {bets.filter(bet => bet.status.toLowerCase() === 'pending').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pendientes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {bets.filter(bet => bet.status.toLowerCase() === 'won').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Ganadas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {bets.filter(bet => bet.status.toLowerCase() === 'lost').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Perdidas</p>
                    </div>
                  </div>

                  {viewMode === 'user' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold">
                            ${bets.reduce((total, bet) => total + parseFloat(bet.amount), 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Apostado</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            ${bets.reduce((total, bet) => total + parseFloat(bet.potentialWinnings), 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Ganancias Potenciales</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lista de apuestas */}
            <div className="grid gap-4 md:grid-cols-2">
              {bets.map((bet) => (
                <Card key={bet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{bet.event.title}</CardTitle>
                        <CardDescription className="capitalize">
                          {bet.event.sport}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bet.status)}`}>
                        {getStatusText(bet.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Opción:</span>
                        <p>{bet.betOption.label}</p>
                      </div>
                      <div>
                        <span className="font-medium">Cuota:</span>
                        <p className="font-mono">{bet.betOption.odds}x</p>
                      </div>
                      <div>
                        <span className="font-medium">Apostado:</span>
                        <p className="font-medium">${formatCurrency(bet.amount)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Ganancia Potencial:</span>
                        <p className="font-medium text-green-600">
                          ${formatCurrency(bet.potentialWinnings)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center text-sm">
                        <span>Estado del evento:</span>
                        <span className="capitalize font-medium">
                          {bet.event.status === 'upcoming' ? 'Próximo' :
                           bet.event.status === 'live' ? 'En vivo' : 'Finalizado'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-3">
                      <p>Evento: {formatDate(bet.event.startTime)}</p>
                      <p>Apuesta realizada: {formatDate(bet.createdAt)}</p>
                      <p className="text-gray-400">ID: #{bet.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
