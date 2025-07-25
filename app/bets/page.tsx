"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}

export default function BetsPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [betOptions, setBetOptions] = useState<BetOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<BetOption | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    async function fetchEventAndOptions() {
      if (!eventId) {
        router.push('/events');
        return;
      }

      try {
        // Obtener información del evento
        const eventRes = await fetch(`/api/events`, {
          credentials: 'include'
        });

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          const foundEvent = eventData.events?.find((e: Event) => e.id === parseInt(eventId));
          setEvent(foundEvent || null);
        }

        // Obtener opciones de apuesta específicas del evento
        setOptionsLoading(true);
        const optionsRes = await fetch(`/api/bet-options/${eventId}`, {
          credentials: 'include'
        });

        if (optionsRes.ok) {
          const optionsData = await optionsRes.json();
          setBetOptions(optionsData.betOptions || []);
        } else {
          console.error("Error fetching bet options:", optionsRes.status);
          const errorData = await optionsRes.json().catch(() => ({}));
          console.error("Error details:", errorData);
          setError(`Error al cargar opciones: ${errorData.details || 'Error desconocido'}`);
        }
      } catch (error) {
        console.error("Error fetching event and options:", error);
      } finally {
        setLoading(false);
        setOptionsLoading(false);
      }
    }

    fetchEventAndOptions();
  }, [eventId, router]);

  async function handlePlaceBet() {
    if (!selectedOption || !amount || !event) return;

    setPlacing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          betOptionId: selectedOption.id,
          amount: parseFloat(amount)
        }),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear apuesta");
      }

      setSuccess("¡Apuesta creada exitosamente!");
      setAmount("");
      setSelectedOption(null);

      // Redirigir al historial después de 2 segundos
      setTimeout(() => {
        router.push("/history");
      }, 2000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear apuesta";
      setError(errorMessage);
    } finally {
      setPlacing(false);
    }
  }

  function calculatePotentialWinnings() {
    if (!selectedOption || !amount) return 0;
    return parseFloat(amount) * selectedOption.odds;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando evento...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Evento no encontrado
            </p>
            <Button
              onClick={() => router.push('/events')}
              className="w-full mt-4"
            >
              Volver a Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push('/events')}
            variant="outline"
          >
            ← Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Realizar Apuesta</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del evento */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Deporte:</span>
                  <p className="capitalize">{event.sport}</p>
                </div>
                <div>
                  <span className="font-medium">Estado:</span>
                  <p className="capitalize">{event.status}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Fecha:</span>
                  <p>{new Date(event.startTime).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opciones de apuesta */}
          <Card>
            <CardHeader>
              <CardTitle>Selecciona tu apuesta</CardTitle>
              <CardDescription>
                Elige una opción y el monto que deseas apostar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionsLoading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Cargando opciones de apuesta...</p>
                </div>
              ) : betOptions.length > 0 ? (
                <div className="space-y-3">
                  {betOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOption?.id === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.label}</span>
                        <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                          {option.odds}x
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay opciones de apuesta disponibles para este evento.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Verifica que el backend esté ejecutándose y que el evento tenga opciones configuradas.
                  </p>
                </div>
              )}

              {selectedOption && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="amount">Monto a apostar</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ingresa el monto"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  {amount && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monto apostado:</span>
                        <span className="font-medium">${amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cuota:</span>
                        <span className="font-medium">{selectedOption.odds}x</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Ganancia potencial:</span>
                        <span className="text-green-600">
                          ${calculatePotentialWinnings().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-green-500 text-sm bg-green-50 p-3 rounded">
                      {success}
                    </div>
                  )}

                  <Button
                    onClick={handlePlaceBet}
                    disabled={!amount || placing || parseFloat(amount) <= 0}
                    className="w-full"
                  >
                    {placing ? "Procesando..." : "Confirmar Apuesta"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
