import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const status = searchParams.get('status');

    let endpoint = API_CONFIG.ENDPOINTS.EVENTS;

    // Construir endpoint según parámetros
    if (sport) {
      endpoint = `/events/sport/${sport}`;
    } else if (status) {
      endpoint = `/events/status/${status}`;
    }

    // Hacer petición al backend de NestJS
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener eventos' },
        { status: response.status }
      );
    }

    const events = await response.json();

    return NextResponse.json({
      success: true,
      events: events
    });

  } catch (error) {
    console.error('Error en eventos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Hacer petición al backend de NestJS para crear evento
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear evento' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      event: data,
      message: 'Evento creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando evento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
