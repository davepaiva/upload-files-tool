# Design Document - Bulk File Upload Tool

## Technology Choices

**UI Framework:** Chakra UI was chosen over Tailwind CSS due to time constraints and Create React App's known PostCSS compatibility issues in rare cases. Chakra UI, being inspired by Tailwind's design principles, provides a reliable component-based approach with excellent TypeScript support and built-in accessibility features.

**Architecture:** Single-page application with component-based architecture using React hooks for state management and Uppy.js for robust file upload handling.

## Queue Implementation

The upload queue is implemented using Uppy.js with a custom React hook (`useFileUpload`) that manages:
- File selection and validation (max 2 directory levels deep)
- Configurable concurrency limits (1-10 concurrent uploads)
- Automatic retry logic for HTTP 5xx errors (max 2 retries)
- Progress tracking and status management
- ARIA live region announcements for accessibility

Files are processed with controlled concurrency using Uppy's Tus plugin, which handles resumable uploads and provides robust error handling.

## Performance Optimizations

- **Memoization:** React.memo and useMemo prevent unnecessary re-renders during upload progress updates
- **Chunked Uploads:** 6MB chunks optimize network utilization and enable resumable uploads
- **Lazy State Updates:** Progress updates are batched to reduce UI thrashing
- **File Filtering:** Directory depth validation prevents excessive file processing
- **Component Isolation:** Atomic design system ensures efficient re-rendering

## User Experience Decisions

**Upload State Management:** File addition is disabled during active uploads to prevent state conflicts and ensure predictable behavior. This design choice prioritizes reliability over convenience due to testing time constraints.

**Settings Modal:** Top-right settings icon provides easy access to concurrency configuration without cluttering the main interface. Modal is disabled during uploads to prevent mid-process configuration changes.

**Progress Visualization:** Dual-level progress display (global and per-file) provides clear feedback at both batch and individual file levels.

## Future Network-Drop Handling

Uppy (thanks to the Tus protocol) gives use methods to pause and resume all uploads.
We could trigger this flow whenever the borswer detects an issue with the network via the JS Navigator object from the browser using event listeners.

Future enhancements could include client-side persistence of upload queue state and automatic retry scheduling.

## Grafana Metrics Strategy

Recommended metrics collection:
- Upload success/failure rates by file type and size 
