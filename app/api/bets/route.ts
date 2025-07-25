import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const betId = searchParams.get('id');

    let endpoint = API_CONFIG.ENDPOINTS.BETS;

    // Construir endpoint según parámetros
    if (user === 'true') {
      endpoint = API_CONFIG.ENDPOINTS.USER_BETS;
    } else if (betId) {
      endpoint = `/bets/${betId}`;
    }

    console.log('Fetching bets from:', `${API_CONFIG.BASE_URL}${endpoint}`);

    // Hacer petición al backend de NestJS
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    console.log('Bets response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        {
          error: 'Error al obtener apuestas',
          details: `Status: ${response.status}, Backend dice: ${errorText}`
        },
        { status: response.status }
      );
    }

    const bets = await response.json();
    console.log('Bets received:', bets);

    return NextResponse.json({
      success: true,
      bets: bets
    });

  } catch (error) {
    console.error('Error en apuestas:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
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

    // Hacer petición al backend de NestJS para crear apuesta
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BETS}`, {
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
        { error: data.message || 'Error al crear apuesta' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      bet: data,
      message: 'Apuesta creada exitosamente'
    });

  } catch (error) {
    console.error('Error creando apuesta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
