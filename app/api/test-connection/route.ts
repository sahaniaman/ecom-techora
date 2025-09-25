import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    // Test the database connection
    await dbConnect();

    // Get the connection state
    const connectionState = mongoose.connection.readyState;
    
    // MongoDB connection states:
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting

    const stateMessages = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    const connectionInfo = {
      status: connectionState === 1 ? 'success' : 'error',
      message: stateMessages[connectionState as keyof typeof stateMessages] || 'Unknown state',
      readyState: connectionState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.connection.models),
      time: new Date().toISOString()
    };

    if (connectionState === 1) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'MongoDB connected successfully',
          data: connectionInfo
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'MongoDB connection issue',
          data: connectionInfo
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to connect to MongoDB',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        time: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
