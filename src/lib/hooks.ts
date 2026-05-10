'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type {
  ClientDto,
  FaqDto,
  FleetCategoryDto,
  FleetItemDto,
  FleetSubcategoryDto,
  OfferingDto,
  ProjectDto,
  TestimonialDto,
} from './types';

// Cache the public catalogue for 5 minutes — it changes only when an admin
// publishes content, so an aggressive stale time keeps the homepage snappy.
const FIVE_MIN = 5 * 60 * 1000;

export function useFleetCategories() {
  return useQuery({
    queryKey: ['fleet', 'categories'],
    queryFn: () => apiFetch<FleetCategoryDto[]>('/api/v1/public/fleet/categories'),
    staleTime: FIVE_MIN,
  });
}

export function useFleetSubcategory(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['fleet', 'subcategory', slug],
    queryFn: () => apiFetch<FleetSubcategoryDto>(`/api/v1/public/fleet/subcategories/${slug}`),
    enabled: Boolean(slug),
    staleTime: FIVE_MIN,
  });
}

export function useFleetItem(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['fleet', 'item', slug],
    queryFn: () => apiFetch<FleetItemDto>(`/api/v1/public/fleet/items/${slug}`),
    enabled: Boolean(slug),
    staleTime: FIVE_MIN,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<ProjectDto[]>('/api/v1/public/projects'),
    staleTime: FIVE_MIN,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => apiFetch<TestimonialDto[]>('/api/v1/public/testimonials'),
    staleTime: FIVE_MIN,
  });
}

export function useOfferings() {
  return useQuery({
    queryKey: ['offerings'],
    queryFn: () => apiFetch<OfferingDto[]>('/api/v1/public/offerings'),
    staleTime: FIVE_MIN,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => apiFetch<FaqDto[]>('/api/v1/public/faqs'),
    staleTime: FIVE_MIN,
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => apiFetch<ClientDto[]>('/api/v1/public/clients'),
    staleTime: FIVE_MIN,
  });
}
