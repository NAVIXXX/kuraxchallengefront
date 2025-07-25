import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Hacer petición al backend de NestJS para registro
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al registrar usuario' },
        { status: response.status }
      );
    }

    // Si el registro es exitoso y viene con token, guardarlo
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set('jwt-token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return NextResponse.json({
        success: true,
        user: data.user,
        token: data.token,
        message: 'Usuario registrado exitosamente'
      });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
