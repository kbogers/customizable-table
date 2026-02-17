# Customizable Table - Development Roadmap

## Completed Features

### ✅ Details Panel Implementation (Current)
- **DetailsPanel Component**: Created side panel that slides in from the right when clicking a request row:
  - Header with request ID, more options button, and close button
  - Tab navigation: Phases, Details (active by default), Orders, Documents, Comments
  - Details tab with comprehensive form fields:
    - Product, Request type, Funding model, Received on, Country, Institution, Rationale, Owner
    - Identifiers section: Patient initials, Patient number, Castor ID, EAP dossier number
    - Physician details section: Email, First name, Last name, Phone number, Specialty
  - Slide-in animation from the right
  - Overlay backdrop that closes panel on click
  - Positioned on top of the table (z-index layering)
  
- **Table Integration**: Updated Table component to support row clicks:
  - Added `onRowClick` prop to Table component
  - Made table rows clickable with cursor pointer
  - Clicking a row opens the details panel with that request's data

- **State Management**: Added selected request state in App.tsx to manage panel visibility and data

- **Editable Form Fields**: Made all form fields in Details tab editable:
  - Local state management for form values (separate from original request data)
  - All input fields, textareas, and select dropdowns are now editable
  - Select dropdowns populated with proper options (Request type, Funding model, Specialty)
  - Focus states with green ring to match design system
  - Change detection to enable/disable Save button
  
- **Save/Cancel Functionality**:
  - Save button (enabled only when changes are detected) saves updates to the request data
  - Cancel button resets form to original values and closes panel
  - Close button and backdrop click reset unsaved changes before closing
  - Updates are reflected immediately in the table after saving

### ✅ Orders Tab Implementation
- **Order Data Model**: Created comprehensive Order interface with all required fields:
  - Customer data (customer_order_number, customer_party_id, customer_party_name, customer_party_address)
  - Patient data (EAP dossier number, approval status, date of approval)
  - Order planning data (order_reminder_date, next_order_expected_date) - calculated by system
  - Order data/identifiers (order_number, order_status, status_updated_at, order_tracking_number, quantity, weeks_ordered, shipment_order_number)
  - Order dates (order_received_on, order_created_on, order_approved_on, order_shipped_on, order_delivered_on)
  
- **OrdersTable Component**: Created new table component with same functionalities as Requests table:
  - Column visibility management with grouped fields (Core, Customer, Patient, Planning, Order Data, Order Dates)
  - Column reordering via drag and drop
  - Column resizing
  - Column pinning
  - Sorting
  - Reset functionality
  
- **Group by Requests Feature**: Implemented grouping functionality:
  - Toggle button to group/ungroup orders by request ID
  - Expandable/collapsible groups showing order count per request
  - Visual grouping with distinct styling for group headers
  
- **Tab Navigation**: Updated App.tsx to handle navigation between:
  - Requests tab (existing)
  - Tasks tab (placeholder)
  - Orders tab (newly implemented)

- **Mock Data Generation**: Created `generateOrders()` function that:
  - Generates 0 to several orders per request
  - Links orders to requests via requestId
  - Calculates order_reminder_date and next_order_expected_date based on order history
  - Generates realistic order statuses and dates based on order lifecycle

## Technical Decisions

1. **Component Structure**: Created separate `OrdersTable.tsx` component to maintain separation of concerns while reusing table functionality patterns from `Table.tsx`

2. **Grouping Implementation**: Used TanStack Table's built-in grouping feature (`getGroupedRowModel`, `getExpandedRowModel`) for efficient grouping and expansion

3. **Data Relationship**: Orders are linked to requests via `requestId` field, allowing for grouping and filtering by request

4. **Column Organization**: Organized columns into logical groups (Core, Customer, Patient, Planning, Order Data, Order Dates) for better UX in column visibility dropdown

5. **Status Visualization**: Used color-coded chips for order status and EAP approval status to provide quick visual feedback

6. **Details Panel Architecture**: 
   - Panel uses fixed positioning with z-index to overlay table
   - Slide-in animation using CSS keyframes with cubic-bezier easing
   - Backdrop overlay for better UX and easy dismissal
   - Tab-based navigation for organizing different views of request data
   - Form fields are fully editable with local state management
   - Change detection using JSON comparison to track unsaved modifications
   - Save/Cancel workflow with automatic reset on close

### ✅ Navigation Bar Redesign (Figma Design Alignment)
- **Unified Navigation Bar**: Restructured the tab navigation and table toolbar into a single unified bar:
  - Tabs (Pending, Requests, Tasks, Orders) on the left with proper Figma styling (18px semibold, 60px height, green-700 bottom border for active tab)
  - Table controls on the right: Status filter dropdown, Columns dropdown with icon, Search input with ⌘K shortcut, Refresh button
  - Added "Pending" tab to match Figma design
  
- **Portal Architecture**: Table toolbar controls are rendered via React `createPortal` into a shared portal target in the navigation bar. This allows each table component (Table, OrdersTable) to render its own toolbar controls while maintaining a unified visual layout in App.tsx.

- **Figma-aligned Controls**:
  - Status filter dropdown with border and rounded-lg styling matching Figma
  - Columns dropdown with calendar_view_week icon and chevron, matching Figma's select component
  - Search input with search icon, placeholder text, and ⌘K keyboard shortcut badge
  - Refresh button as a circular icon button

### ✅ Group by Request in Columns Dropdown
- Moved "Group by Request" toggle from standalone toolbar button into the Columns dropdown as the first option
- Uses a toggle switch UI (green when active, gray when inactive) for clear on/off state
- Separated from column visibility options by a divider line
- Only appears in the Orders table's Columns dropdown (not in Requests table)

### ✅ Request Details in Group Headers
- When grouping by request, group header rows now show physician, institution, country, and phase
- Request data is passed from App.tsx to OrdersTable via new `requests` prop
- A `requestMap` (memoized) lookup enables efficient request detail retrieval per group
- Details are displayed subtly: small text (`text-xs`), gray color, dot separators, with phase slightly bolder
- Long physician/institution names are truncated with `truncate` + title tooltip

### ✅ Order Notes Feature
- **Order Notes Field**: Added `notes` field to Order interface for storing contextual, operational information
- **Multi-line Text Support**: Implemented textarea input in OrderDetailsView component for entering multi-line notes
- **Persistence**: Notes are saved with the order and persist after save and refresh (via existing save mechanism)
- **UI Integration**: Notes field is visible in the Order Details panel with a dedicated section and divider
- **Data Model**: Updated `generateOrders()` function to include empty notes field for generated orders
- **New Order Creation**: New orders created via "Add order" button include the notes field initialized as empty string

### ✅ Order Expand/Collapse Feature
- **Expandable Order Items**: Orders in the Orders tab can now be expanded/collapsed by clicking the chevron icon
- **Timeline View**: Expanded orders show a visual timeline with order status progression:
  - Vertical timeline indicator with green segments for completed steps and gray for incomplete steps
  - Circular indicator at the bottom of the timeline
  - Shows order dates: Expected, Received, Approved, Shipped, Delivered
- **Date Display**: Dates are shown as underlined blue links, with "Add date" placeholder for missing dates
- **State Management**: Uses Set to track which orders are expanded, allowing multiple orders to be expanded simultaneously
- **Interaction**: Chevron click toggles expansion without opening the full order details panel (clicking the order row still opens details)

### ✅ Inline Editing
- **Editable columns system**: Each column in `columnConfig` now has an `editable` boolean flag and optional `editorType` + `options` properties
  - Editable columns: Owner (text), Phase (select), Comments (textarea), Product (text), Request type (select), Funding model (select), Rationale (textarea), Patient initials (text), Castor ID (text)
  - Read-only columns: Request #, Physician, Institution, Country, Received on, Patient number, EAP dossier number, all Physician details
  
- **Hover interaction**: 
  - All cells show light grey background on hover (`hover:bg-gray-100`)
  - Editable cells show a pencil icon on the right side during hover
  
- **Edit triggering**:
  - Clicking the pencil icon enters inline edit mode (one cell at a time)
  - Clicking anywhere else in the cell opens the Details Panel with that field auto-focused
  
- **Editor types**:
  - Text input: for Owner, Product, Patient initials, Castor ID
  - Select dropdown: for Phase (phases), Request type (requestTypes), Funding model (fundingModels) — auto-saves on selection
  - Textarea: for Comments, Rationale — expanding text area with save via ⌘Enter
  
- **Save/cancel behavior**:
  - Save: ✓ button, Enter key (text/select), ⌘Enter (textarea), or blur (click away)
  - Cancel: ✕ button or Esc key
  - Changes are saved immediately to the data (no row-level or bulk save)
  - Only one cell can be edited at a time
  
- **Data flow**:
  - `Table.tsx` receives `onCellSave(requestId, field, value)` callback
  - `App.tsx` handles the cell save by updating `requestsData`
  - `Table.tsx` also receives `onCellClick(request, field)` for opening the details panel
  
- **Details Panel integration**:
  - New `focusField` prop on `DetailsPanel` auto-switches to Details tab and focuses the corresponding form field
  - All form fields have `data-field` attributes for programmatic focus

- **Race condition fix**: `doSave` and `handleKeyDown` now read the current value directly from the DOM element (`inputRef.current.value`) via `getCurrentValue()` instead of relying on the React `value` prop, which could be stale due to asynchronous state updates. This ensures the correct value is saved when pressing Enter quickly after typing.

- **Decisions**:
  - Blur = save (not cancel) — user chose save-on-blur for spreadsheet-like UX
  - Textarea uses ⌘/Ctrl+Enter to save (regular Enter inserts newline)
  - `savedRef` guard prevents double-save when select onChange + blur fire together

## Future Enhancements (Potential)

- Filtering functionality for orders
- Export functionality
- Bulk operations on orders
- Advanced search
- Tasks tab implementation
- Real-time data updates
- Pagination for large datasets
- Details Panel: Implement other tabs (Phases, Orders, Documents, Comments)
- Details Panel: Add unsaved changes warning dialog before closing
- Details Panel: Add form validation
- Details Panel: Add loading states for save operations
