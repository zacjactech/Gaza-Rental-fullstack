import { IUser } from '@/lib/models/user';
import { IProperty } from '@/lib/models/property';
import { IBooking } from '@/lib/models/booking';
import { IReview } from '@/lib/models/review';
import { IFavorite } from '@/lib/models/favorite';

export type SafeUser = Omit<IUser, 'password'> & {
  createdAt: string;
  updatedAt: string;
};

export type SafeProperty = Omit<IProperty, 'landlordId'> & {
  createdAt: string;
  updatedAt: string;
  landlordId: string;
};

export type SafeBooking = Omit<IBooking, 'propertyId' | 'userId'> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  propertyId: string;
  userId: string;
};

export type SafeReview = Omit<IReview, 'propertyId' | 'userId'> & {
  createdAt: string;
  propertyId: string;
  userId: string;
};

export type SafeFavorite = Omit<IFavorite, 'propertyId' | 'userId'> & {
  createdAt: string;
  propertyId: string;
  userId: string;
}; 