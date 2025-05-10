import { IBooking } from "@/lib/models/booking";

interface IParams {
  userId?: string;
  propertyId?: string;
}

export default async function getReservations(
  params: IParams
): Promise<IBooking[]> {
  try {
    const { userId, propertyId } = params;
    const queryParams = new URLSearchParams();
    
    if (userId) queryParams.append('userId', userId);
    if (propertyId) queryParams.append('propertyId', propertyId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bookings?${queryParams.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const bookings: IBooking[] = await response.json();
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
} 