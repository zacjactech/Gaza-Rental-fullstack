import { IProperty } from "@/lib/models/property";

interface IParams {
  id?: string;
}

export default async function getListingById(
  id: string
): Promise<IProperty | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }

    const property: IProperty = await response.json();
    return property;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
} 