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
  NO_INVOICES_YET: {
    title: 'No invoices yet',
    message: 'Payment history and receipts will appear here once you have completed a booking or top-up.',
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
  /** Public page canvas empty state */
  PUBLIC_PAGE_CANVAS_EMPTY: {
    title: 'Drag blocks here',
    message: 'Drag blocks from the left panel to build the page, or browse blocks below.',
    actionLabel: 'Browse blocks',
  },
  NO_TRAINER_APPLICATIONS_FOUND: {
    title: 'No trainer applications found',
    message: 'Applications will appear here.',
  },
  NO_REVIEW_SOURCES_YET: {
    title: 'No review sources yet',
    message: 'Add a Google or Trustpilot source to sync reviews. Configure API credentials and run sync to import reviews.',
    actionLabel: 'Add review source',
  },
  NO_EXTERNAL_REVIEWS_FOUND: {
    title: 'No external reviews found',
    message: 'Sync reviews from your Google or Trustpilot sources above, or adjust filters.',
  },
  NO_TESTIMONIALS_YET: {
    title: 'No curated testimonials yet',
    message: 'Add a review manually or promote one from the external reviews table below.',
    actionLabel: 'Add review',
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
  /** Panel shown when parent clicks calendar but has no hours left (only option is top up) */
  NO_HOURS_LEFT_PANEL: { title: 'No hours left', message: 'Top up to add more hours.', actionLabel: 'Top up' },
  NO_BOOKINGS_YET_HEADING: { title: 'No Bookings Yet', message: 'Create a booking to get started.' },

  /** Parent dashboard right sidebar – minimal, calendar-style labels */
  PARENT_SIDEBAR: {
    /** Dropdown at top of right sidebar (Add child, Report a concern) */
    CREATE_BUTTON_LABEL: 'Actions',
    ADD_CHILD_LABEL: 'Add child',
    REPORT_CONCERN_LABEL: 'Report a concern',
    ALL_CLEAR: 'All clear',
    HOURS_AVAILABLE: 'available',
    HOURS_REMAINING: 'remaining',
    HOURS_BOOKED: 'booked',
    HOURS_USED: 'used',
    VIEW_BREAKDOWN: 'View breakdown',
    BOOK_SESSION: 'Book session',
    BOOK_SESSION_READY: 'Ready to book',
    BUY_HOURS: 'Buy hours',
    /** Hours breakdown panel (Google Calendar–style) */
    BREAKDOWN: {
      TITLE: 'Package hours by child',
      DESCRIPTION: 'Remaining hours, low-hours alerts and quick actions.',
      CLOSE_LABEL: 'Close',
      SECTION_HEADING: 'By child',
      SORT_LABEL: 'Sort by',
      SORT_NAME: 'Name',
      SORT_HOURS_LEFT: 'Hours left',
      SORT_USAGE_PCT: 'Usage %',
      FILTER_LOW_ONLY: 'Low hours only',
      CLEAR_FILTERS: 'Clear filters',
      VIEW_CARDS: 'Cards',
      VIEW_LIST: 'List',
      VIEW_COMPARISON: 'Comparison',
      LEFT_OF: 'left of',
      REMAINING: 'remaining',
      UPCOMING: 'upcoming',
      EXPIRES: 'Expires',
      BOOK_SESSION_LABEL: 'Book session',
      TOP_UP: 'Top up',
      BUY_HOURS_LABEL: 'Buy hours',
      ALL_SET_MESSAGE: 'All set – all children have active packages.',
      NO_LOW_HOURS_TITLE: 'No children with low hours',
      NO_LOW_HOURS_MESSAGE: 'All children have more than 25% of their package remaining.',
    },
  },

  /** Parent booking modal – standard activities (database list) collapsible section */
  STANDARD_ACTIVITY_SECTION: {
    TOOLTIP_TITLE: 'Standard Activities',
    SHORT_LABEL: 'Standard Activities',
    /** When session is at cap; no "remove one" – section is disabled. */
    SESSION_FULL: 'Session full',
    /** Shown when session exceeds remaining hours: how to reduce total. */
    REMOVE_ACTIVITIES_HINT:
      'To fit within your hours: uncheck activities in the list above, or click the × next to each selected activity below.',
  },

  /** Parent booking modal – custom activity (optional) collapsible section */
  CUSTOM_ACTIVITY_SECTION: {
    TOOLTIP_TITLE: 'Add Custom Activity',
    /** Tooltip for the + icon beside Standard Activities that opens the add-your-own popover */
    ADD_YOUR_OWN_ACTIVITY_TOOLTIP: 'Add your own activity',
    SHORT_LABEL: 'Custom',
    NOT_IN_LIST: 'Not in the list? Add one here.',
    PLACEHOLDER: 'e.g., Baking, Lego building...',
    HOURS_LABEL: 'Hours',
    REMAINING_MESSAGE: 'You can still add more custom activities within the remaining session time.',
    NO_REMAINING_MESSAGE: 'No remaining time available for additional custom activities in this session.',
    ADD_BUTTON: 'Add custom activity',
  },
} as const;

export type EmptyStateKey = keyof typeof EMPTY_STATE;
