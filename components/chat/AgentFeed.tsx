'use client';

import type { ChatMessage, SubwayStatus, WeatherData, RideStatus, FoodOrder, ErrandStatus, Reservation, EventListing, SearchResult, BikeStation, FinancialSummary, Restaurant } from '@/lib/types';
import UserMessage from './UserMessage';
import ReasoningStep from './ReasoningStep';
import ToolCallIndicator from './ToolCallIndicator';
import AssistantMessage from './AssistantMessage';
import ErrorMessage from './ErrorMessage';
import SubwayStatusCard from '@/components/cards/SubwayStatusCard';
import WeatherCard from '@/components/cards/WeatherCard';
import RideStatusCard from '@/components/cards/RideStatusCard';
import FoodOrderCard from '@/components/cards/FoodOrderCard';
import ErrandCard from '@/components/cards/ErrandCard';
import ReservationTicket from '@/components/cards/ReservationTicket';
import EventCard from '@/components/cards/EventCard';
import SearchResultsFeed from '@/components/cards/SearchResultsFeed';
import BikeAvailabilityCard from '@/components/cards/BikeAvailabilityCard';
import BudgetSummaryCard from '@/components/cards/BudgetSummaryCard';
import RestaurantCard from '@/components/cards/RestaurantCard';

interface AgentFeedProps {
  messages: ChatMessage[];
}

function renderCard(message: ChatMessage) {
  if (!message.toolResult || !message.cardType) return null;

  const data = message.toolResult;

  switch (message.cardType) {
    case 'subway_status':
      return <SubwayStatusCard data={data as SubwayStatus} />;
    case 'weather':
      return <WeatherCard data={data as WeatherData} />;
    case 'ride_status':
      return <RideStatusCard data={data as RideStatus} />;
    case 'food_order':
      return <FoodOrderCard data={data as FoodOrder} />;
    case 'errand':
      return <ErrandCard data={data as ErrandStatus} />;
    case 'reservation':
      return <ReservationTicket data={data as Reservation} />;
    case 'event':
      if (Array.isArray(data)) {
        return (
          <div className="space-y-2">
            {(data as EventListing[]).map((evt, i) => (
              <EventCard key={i} data={evt} />
            ))}
          </div>
        );
      }
      return <EventCard data={data as EventListing} />;
    case 'search_results':
      return <SearchResultsFeed data={Array.isArray(data) ? data as SearchResult[] : [data as SearchResult]} />;
    case 'bike_availability':
      return <BikeAvailabilityCard data={Array.isArray(data) ? data as BikeStation[] : [data as BikeStation]} />;
    case 'budget_summary':
      return <BudgetSummaryCard data={data as FinancialSummary} />;
    case 'restaurant':
      if (Array.isArray(data)) {
        return (
          <div className="space-y-2">
            {(data as Restaurant[]).map((r, i) => (
              <RestaurantCard key={i} data={r} />
            ))}
          </div>
        );
      }
      return <RestaurantCard data={data as Restaurant} />;
    default:
      return null;
  }
}

export default function AgentFeed({ messages }: AgentFeedProps) {
  return (
    <div className="space-y-3 py-4">
      {messages.map((message) => {
        switch (message.role) {
          case 'user':
            return <UserMessage key={message.id} content={message.content} />;
          case 'reasoning':
            return (
              <ReasoningStep
                key={message.id}
                content={message.content}
                isStreaming={message.status === 'streaming'}
              />
            );
          case 'tool_call':
            return (
              <ToolCallIndicator
                key={message.id}
                toolName={message.toolName || 'unknown'}
                status={message.status === 'error' ? 'error' : message.status === 'complete' ? 'complete' : 'pending'}
              />
            );
          case 'tool_result':
            return (
              <div key={message.id}>
                {renderCard(message)}
              </div>
            );
          case 'assistant':
            if (message.status === 'error') {
              return <ErrorMessage key={message.id} content={message.content} />;
            }
            return <AssistantMessage key={message.id} content={message.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
