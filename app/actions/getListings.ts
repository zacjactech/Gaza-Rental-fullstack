import { IProperty } from "@/lib/models/property";

export default async function getListings() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    const properties: IProperty[] = await response.json();
    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
} 