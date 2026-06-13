<template>
  <v-chip
    :color="chipColor"
    :prepend-icon="chipIcon"
    size="small"
    variant="tonal"
    label
  >
    {{ label }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatEnum } from '@/shared/utils/formatters'

const props = defineProps<{
  status: string
  type?: string
}>()

const statusMap: Record<string, { color: string; icon: string }> = {
  ACTIVE: { color: 'success', icon: 'mdi-check-circle' },
  AVAILABLE: { color: 'success', icon: 'mdi-check-circle' },
  FULL: { color: 'warning', icon: 'mdi-account-group' },
  UNDER_MAINTENANCE: { color: 'warning', icon: 'mdi-wrench' },
  INACTIVE: { color: 'grey', icon: 'mdi-minus-circle' },
  PENDING: { color: 'info', icon: 'mdi-clock-outline' },
  SUBMITTED: { color: 'primary', icon: 'mdi-send' },
  APPROVED: { color: 'success', icon: 'mdi-check-all' },
  REJECTED: { color: 'error', icon: 'mdi-close-circle' },
  CANCELLED: { color: 'grey', icon: 'mdi-cancel' },
  TERMINATED: { color: 'error', icon: 'mdi-file-remove' },
  EXPIRED: { color: 'grey', icon: 'mdi-calendar-remove' },
  PAID: { color: 'success', icon: 'mdi-cash-check' },
  UNPAID: { color: 'error', icon: 'mdi-cash-remove' },
  OVERDUE: { color: 'error', icon: 'mdi-alert' },
  BROKEN: { color: 'error', icon: 'mdi-tools' },
  RETIRED: { color: 'grey', icon: 'mdi-archive' },
  OCCUPIED: { color: 'info', icon: 'mdi-account' },
  CHECKED_OUT: { color: 'grey', icon: 'mdi-logout' },
  NEW: { color: 'info', icon: 'mdi-new-box' },
  IN_PROGRESS: { color: 'warning', icon: 'mdi-progress-wrench' },
  COMPLETED: { color: 'success', icon: 'mdi-check-circle' },
  GRADUATED: { color: 'info', icon: 'mdi-school' },
  SUSPENDED: { color: 'error', icon: 'mdi-account-off' },
}

const chipColor = computed(() => statusMap[props.status]?.color || 'grey')
const chipIcon = computed(() => statusMap[props.status]?.icon || 'mdi-help-circle')
const label = computed(() => formatEnum(props.status))
</script>
