import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Hacer petición al backend de NestJS
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error de autenticación' },
        { status: response.status }
      );
    }

    // Si el login es exitoso, guardar el JWT en una cookie segura
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set('jwt-token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      // También guardarlo en localStorage para el cliente
      return NextResponse.json({
        success: true,
        user: data.user,
        token: data.token,
        message: 'Login exitoso'
      });
    }

    return NextResponse.json(
      { error: 'Token no recibido del servidor' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
