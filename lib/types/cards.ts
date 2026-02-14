import type {
  SubwayStatus,
  WeatherData,
  RideStatus,
  FoodOrder,
  ErrandStatus,
  Reservation,
  EventListing,
  SearchResult,
  BikeStation,
  FinancialSummary,
  Restaurant,
} from './index';

export interface SubwayStatusCardProps {
  data: SubwayStatus;
}

export interface WeatherCardProps {
  data: WeatherData;
}

export interface RideStatusCardProps {
  data: RideStatus;
}

export interface FoodOrderCardProps {
  data: FoodOrder;
}

export interface ErrandCardProps {
  data: ErrandStatus;
}

export interface ReservationTicketProps {
  data: Reservation;
}

export interface EventCardProps {
  data: EventListing;
}

export interface SearchResultsFeedProps {
  data: SearchResult[];
}

export interface BikeAvailabilityCardProps {
  data: BikeStation[];
}

export interface BudgetSummaryCardProps {
  data: FinancialSummary;
}

export interface RestaurantCardProps {
  data: Restaurant;
}
