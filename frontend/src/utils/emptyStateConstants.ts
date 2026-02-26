/**
 * Empty state copy — single source of truth for "No … yet" / "No … found" messages.
 * Use with EmptyState component; never hardcode empty-state strings in components.
 */

export const EMPTY_STATE = {
  // Generic / tables
  NO_RESULTS: {
    title: 'No results found',
    message: 'Try adjusting your filters or add a new item.',
  },

  // Bookings
  NO_BOOKINGS_YET: {
    title: 'No bookings yet',
    message: 'Create a booking to get started.',
  },
  NO_SESSIONS_BOOKED_YET: {
    title: 'No sessions booked yet',
    message: 'Sessions for this booking will appear here once scheduled.',
  },
  NO_SESSIONS_YET: {
    title: 'No sessions yet',
    message: 'Your scheduled sessions will appear here.',
  },

  // Children / family
  NO_CHILDREN_ADDED_YET: {
    title: 'No children added yet',
    message: 'Add your first child to start booking sessions.',
  },
  NO_CHILDREN_LINKED_YET: {
    title: 'No children linked yet',
    message: 'Link a child to see their information here.',
  },

  // Activity / logs
  NO_ACTIVITY_LOGS_YET: {
    title: 'No activity logs yet',
    message: 'Activity logs for this session will appear here.',
  },
  NO_LOGS_YET: {
    title: 'No logs yet',
    message: 'Logs will appear here once activity is recorded.',
  },
  NO_ENTRIES_YET: {
    title: 'No entries yet',
    message: 'Add a log to start the history.',
  },
  NO_ACTIVITY_RECORDED: {
    title: 'No session activity recorded',
    message: 'No activity has been recorded for this session.',
  },
  NO_LIVE_UPDATES_YET: {
    title: 'No live updates yet',
    message: 'Live updates for this session will appear here.',
  },
  NO_ACTIVITIES_IN_SYSTEM: {
    title: 'No activities in the system yet',
    message: 'Contact admin to add activities.',
  },
  NO_ACTIVITIES_ASSIGNED_YET: {
    title: 'No activities assigned yet',
    message: 'Assign activities to show them here.',
  },
  NO_ACTIVITY_LOGS_FOR_PERIOD: {
    title: 'No activity logs',
    message: 'No activity logs found for this period.',
  },

  // Trainer notes
  NO_TRAINER_NOTES_YET: {
    title: 'No trainer notes yet',
    message:
      "Summary notes from your child's trainer will appear here after completed sessions. You can also see live activity logs during and after each session from the schedule.",
  },

  // Trainer / admin lists
  NO_TRAINEES_YET: {
    title: 'No trainees yet',
    message: 'Trainees will appear here when assigned.',
  },
  NO_NOTES_YET: {
    title: 'No notes yet',
    message: 'Add a note to get started.',
  },
  NO_QUALIFICATIONS_UPLOADED_YET: {
    title: 'No qualifications uploaded yet',
    message: 'Upload qualifications to display them here.',
  },
  NO_PHOTOS_UPLOADED_YET: {
    title: 'No photos uploaded yet',
    message: 'Upload photos to show them here.',
  },
  NO_AVAILABLE_SHIFTS_YET: {
    title: 'No available shifts yet',
    message: 'This will be populated from the backend.',
  },
  NO_SHIFTS_OR_AVAILABILITY: {
    title: 'No shifts or availability',
    message: 'No shifts or availability records for this period.',
  },
  NO_TIMESHEET_ENTRIES_YET: {
    title: 'No timesheet entries yet',
    message: 'Timesheet entries will appear here.',
  },
  NO_CLIENTS_LOADED_YET: {
    title: 'No clients loaded yet',
    message: 'Clients will appear here when available.',
  },

  // Admin list pages
  NO_SERVICES_FOUND: { title: 'No services found', message: 'Add a service or adjust filters.' },
  NO_PACKAGES_FOUND: { title: 'No packages found', message: 'Add a package or adjust filters.' },
  NO_BOOKINGS_FOUND: { title: 'No bookings found', message: 'Bookings will appear here.' },
  NO_USERS_FOUND: { title: 'No users found', message: 'Users will appear here.' },
  NO_TRAINERS_FOUND: { title: 'No trainers found', message: 'Add a trainer or adjust filters.' },
  NO_PARENTS_FOUND: { title: 'No parents found', message: 'Parents will appear here.' },
  NO_CHILDREN_FOUND: { title: 'No children found', message: 'Children will appear here.' },
  NO_ACTIVITIES_FOUND: { title: 'No activities found', message: 'Add an activity or adjust filters.' },
  NO_PAGES_FOUND: { title: 'No pages found', message: 'Add a page or adjust filters.' },
  NO_BLOCKS_YET: {
    title: 'No blocks yet',
    message: 'Add a block (Hero, Rich Text, CTA, FAQ, etc.) to build the page.',
  },
  NO_TRAINER_APPLICATIONS_FOUND: {
    title: 'No trainer applications found',
    message: 'Applications will appear here.',
  },

  // Progress
  NO_PROGRESS_DATA_YET: {
    title: 'No progress data yet',
    message: 'Progress data will appear here once sessions are completed.',
  },

  // Public / blog
  NO_BLOG_POSTS_FOUND: { title: 'No blog posts found', message: 'Articles will appear here.' },
  NO_ARTICLES_FOUND: { title: 'No articles found', message: 'Check back later for new content.' },
  NO_FAQS_FOUND: { title: 'No FAQs found', message: 'FAQs will appear here.' },

  // Inline / dropdown
  NO_ACTIVITIES_FOUND_DROPDOWN: { title: 'No activities found', message: 'Try a different search or add a custom activity.' },
  NO_ACTIVITIES_FOUND_IN_DATABASE: { title: 'No activities found in database', message: 'Contact admin to add activities.' },
  NO_HOURS_PURCHASED_YET: { title: 'No hours purchased yet', message: 'Buy hours to book sessions.' },
  NO_BOOKINGS_YET_HEADING: { title: 'No Bookings Yet', message: 'Create a booking to get started.' },
} as const;

export type EmptyStateKey = keyof typeof EMPTY_STATE;
