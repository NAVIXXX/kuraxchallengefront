import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    // Hacer petición al backend de NestJS para obtener el perfil
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener perfil de usuario' },
        { status: response.status }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
