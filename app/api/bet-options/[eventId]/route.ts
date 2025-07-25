import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento requerido' },
        { status: 400 }
      );
    }

    // Hacer petición al backend de NestJS para obtener opciones de apuesta
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BET_OPTIONS}/${eventId}`;
    console.log('Fetching bet options from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);

      return NextResponse.json(
        {
          error: 'Error al obtener opciones de apuesta',
          details: `Status: ${response.status}, Backend dice: ${errorText}`,
          eventId: eventId,
          url: url
        },
        { status: response.status }
      );
    }

    const betOptions = await response.json();
    console.log('Bet options received:', betOptions);

    return NextResponse.json({
      success: true,
      betOptions: betOptions,
      eventId: eventId
    });

  } catch (error) {
    console.error('Error en opciones de apuesta:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
