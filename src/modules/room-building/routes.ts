import type { RouteRecordRaw } from 'vue-router'

export const roomBuildingRoutes: RouteRecordRaw[] = [
  {
    path: 'room-building',
    redirect: '/app/room-building/overview',
  },
  {
    path: 'room-building/overview',
    name: 'room-building-overview',
    component: () => import('./views/OverviewView.vue'),
  },
  {
    path: 'room-building/buildings',
    name: 'room-building-buildings',
    component: () => import('./views/BuildingsView.vue'),
  },
  {
    path: 'room-building/room-types',
    name: 'room-building-room-types',
    component: () => import('./views/RoomTypesView.vue'),
  },
  {
    path: 'room-building/rooms',
    name: 'room-building-rooms',
    component: () => import('./views/RoomsView.vue'),
  },
  {
    path: 'room-building/availability',
    name: 'room-building-availability',
    component: () => import('./views/AvailabilityView.vue'),
  },
]
