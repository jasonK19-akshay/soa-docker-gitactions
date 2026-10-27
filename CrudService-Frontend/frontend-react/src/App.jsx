import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from './Api.js';

const emptyForm = {
  title: '',
  platformName: '',
  durationHours: '1',
  paid: false,
};

function validateForm(form) {
  const errors = {};
  const title = form.title.trim();
  const platformName = form.platformName.trim();
  const duration = Number(form.durationHours);

  if (!title) {
    errors.title = 'Enter a course title.';
  } else if (title.length > 50) {
    errors.title = 'Use 50 characters or fewer.';
  }

  if (!platformName) {
    errors.platformName = 'Enter the learning platform.';
  } else if (platformName.length > 50) {
    errors.platformName = 'Use 50 characters or fewer.';
  }

  if (
    !form.durationHours ||
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > 10000
  ) {
    errors.durationHours = 'Enter a whole number from 1 to 10000.';
  }

  return errors;
}

function App() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // READ: Fetch all courses from the backend.
  const loadCourses = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const response = await api.get('/courses');

      setCourses(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (error) {
      setNotice({
        type: 'danger',
        text: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Search by course title, platform name or ID.
  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return courses;
    }

    return courses.filter((course) =>
      [
        course.title,
        course.platformName,
        String(course.id),
      ].some((value) =>
        String(value).toLowerCase().includes(term),
      ),
    );
  }, [courses, search]);

  const paidCount = courses.filter(
    (course) => course.paid,
  ).length;

  const freeCount = courses.length - paidCount;

  function clearNotice() {
    setNotice(null);
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
  }

  // CREATE or UPDATE, depending on editingId.
  async function submitForm(event) {
    event.preventDefault();

    setNotice(null);

    const fieldErrors = validateForm(form);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    // The ID is deliberately excluded from this payload.
    const payload = {
      title: form.title.trim(),
      platformName: form.platformName.trim(),
      durationHours: Number(form.durationHours),
      paid: Boolean(form.paid),
    };

    setSaving(true);

    try {
      if (editingId === null) {
        // CREATE: POST /api/courses
        const response = await api.post('/courses', payload);

        setNotice({
          type: 'success',
          text: `“${response.data.title}” was added successfully (ID ${response.data.id}).`,
        });
      } else {
        // UPDATE: PUT /api/courses/{id}
        const response = await api.put(
          `/courses/${editingId}`,
          payload,
        );

        setNotice({
          type: 'success',
          text: `“${response.data.title}” was updated successfully.`,
        });
      }

      resetForm();
      await loadCourses(false);
    } catch (error) {
      setNotice({
        type: 'danger',
        text: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  // Load one record and fill the form for editing.
  async function startEdit(course) {
    setNotice(null);
    setErrors({});

    try {
      // READ: GET /api/courses/{id}
      const response = await api.get(`/courses/${course.id}`);
      const current = response.data;

      setForm({
        title: current.title ?? '',
        platformName: current.platformName ?? '',
        durationHours: String(current.durationHours ?? 1),
        paid: Boolean(current.paid),
      });

      setEditingId(current.id);

      setNotice({
        type: 'info',
        text: `Editing course ID ${current.id}. The ID is shown for reference and cannot be edited.`,
      });

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      setNotice({
        type: 'danger',
        text: getErrorMessage(error),
      });
    }
  }

  // READ: Display the details of one course.
  async function viewCourse(id) {
    setLoadingDetails(true);
    setSelectedCourse(null);
    setNotice(null);

    try {
      const response = await api.get(`/courses/${id}`);
      setSelectedCourse(response.data);
    } catch (error) {
      setNotice({
        type: 'danger',
        text: getErrorMessage(error),
      });
    } finally {
      setLoadingDetails(false);
    }
  }

  // DELETE: Remove a course after confirmation.
  async function deleteCourse(course) {
    const confirmed = window.confirm(
      `Delete “${course.title}” (ID ${course.id})? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(course.id);
    setNotice(null);

    try {
      await api.delete(`/courses/${course.id}`);

      setNotice({
        type: 'success',
        text: `“${course.title}” was deleted successfully.`,
      });

      if (editingId === course.id) {
        resetForm();
      }

      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
      }

      await loadCourses(false);
    } catch (error) {
      setNotice({
        type: 'danger',
        text: getErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-shell">

      {/* Navigation bar */}
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container py-2">
          <a
            className="navbar-brand d-flex align-items-center gap-2"
            href="#top"
          >
            <span className="brand-mark">C</span>
            <span>
              Course<span className="brand-light">Hub</span>
            </span>
          </a>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="navbar-caption d-none d-sm-inline">
              Online Course Manager
            </span>

            <a
              className="btn btn-sm btn-outline-light"
              href="/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
            >
              API Docs ↗
            </a>
          </div>
        </div>
      </nav>

      <main id="top" className="container app-main py-4 py-lg-5">

        {/* Hero section */}
        <section className="hero-section mb-4 mb-lg-5">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              FULL-STACK CRUD PROJECT
            </div>

            <h1>
              Manage your learning <span>library.</span>
            </h1>

            <p className="hero-copy">
              Keep your online courses organised. Create, view,
              update and remove records from one simple dashboard.
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-book">
              <span />
              <span />
              <span />
            </div>
            <div className="floating-chip chip-top">CRUD</div>
            <div className="floating-chip chip-bottom">
              API connected
            </div>
          </div>
        </section>

        {/* Success and error messages */}
        {notice && (
          <div
            className={`alert alert-${notice.type} alert-dismissible d-flex align-items-start gap-2`}
            role="status"
          >
            <span className="notice-icon">
              {notice.type === 'success'
                ? '✓'
                : notice.type === 'danger'
                  ? '!'
                  : 'i'}
            </span>

            <div className="flex-grow-1">{notice.text}</div>

            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={clearNotice}
            />
          </div>
        )}

        {/* Summary cards */}
        <section className="row g-3 summary-row mb-4">

          <div className="col-12 col-md-4">
            <div className="summary-card">
              <div className="summary-icon icon-blue">▤</div>
              <div>
                <div className="summary-label">Total courses</div>
                <div className="summary-value">{courses.length}</div>
              </div>
              <span className="summary-foot">in your library</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="summary-card">
              <div className="summary-icon icon-violet">◆</div>
              <div>
                <div className="summary-label">Paid courses</div>
                <div className="summary-value">{paidCount}</div>
              </div>
              <span className="summary-foot">premium access</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="summary-card">
              <div className="summary-icon icon-green">✓</div>
              <div>
                <div className="summary-label">Free courses</div>
                <div className="summary-value">{freeCount}</div>
              </div>
              <span className="summary-foot">open learning</span>
            </div>
          </div>

        </section>

        <section className="row g-4 align-items-start">

          {/* Add and update form */}
          <div className="col-12 col-lg-4">
            <div className="panel form-panel">

              <div className="panel-heading">
                <div>
                  <div className="section-kicker">COURSE DETAILS</div>

                  <h2>
                    {editingId === null
                      ? 'Add a course'
                      : 'Update course'}
                  </h2>

                  <p>
                    {editingId === null
                      ? 'Fill in the details below to add a new course.'
                      : `You are updating course ID ${editingId}.`}
                  </p>
                </div>

                <div className="heading-symbol">
                  {editingId === null ? '+' : '✎'}
                </div>
              </div>

              <form onSubmit={submitForm} noValidate>

                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Course title <span className="required-star">*</span>
                  </label>

                  <input
                    id="title"
                    name="title"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    value={form.title}
                    onChange={updateField}
                    maxLength={50}
                    placeholder="e.g. Cloud Computing Fundamentals"
                    required
                  />

                  {errors.title && (
                    <div className="invalid-feedback">
                      {errors.title}
                    </div>
                  )}

                  <div className="form-text">
                    Up to 50 characters.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="platformName" className="form-label">
                    Learning platform <span className="required-star">*</span>
                  </label>

                  <input
                    id="platformName"
                    name="platformName"
                    className={`form-control ${errors.platformName ? 'is-invalid' : ''}`}
                    value={form.platformName}
                    onChange={updateField}
                    maxLength={50}
                    placeholder="e.g. Coursera, Udemy, NPTEL"
                    required
                  />

                  {errors.platformName && (
                    <div className="invalid-feedback">
                      {errors.platformName}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="durationHours" className="form-label">
                    Duration <span className="required-star">*</span>
                  </label>

                  <div className="input-group">
                    <input
                      id="durationHours"
                      name="durationHours"
                      type="number"
                      className={`form-control ${errors.durationHours ? 'is-invalid' : ''}`}
                      min="1"
                      max="10000"
                      step="1"
                      value={form.durationHours}
                      onChange={updateField}
                      required
                    />

                    <span className="input-group-text">hours</span>

                    {errors.durationHours && (
                      <div className="invalid-feedback">
                        {errors.durationHours}
                      </div>
                    )}
                  </div>

                  <div className="form-text">
                    Enter a whole number from 1 to 10000.
                  </div>
                </div>

                <div className="paid-switch mb-4">
                  <div>
                    <div className="paid-title">Paid course?</div>
                    <div className="form-text mt-0">
                      Turn on if payment is required.
                    </div>
                  </div>

                  <div className="form-check form-switch mb-0">
                    <input
                      id="paid"
                      name="paid"
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={form.paid}
                      onChange={updateField}
                    />

                    <label className="form-check-label" htmlFor="paid">
                      {form.paid ? 'Paid' : 'Free'}
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Saving…
                      </>
                    ) : editingId === null ? (
                      '+ Add course'
                    ) : (
                      'Save changes'
                    )}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="id-note">
                  <span>↳</span> Course ID is generated automatically.
                  No ID is entered here.
                </div>

              </form>
            </div>
          </div>

          {/* Course list */}
          <div className="col-12 col-lg-8">
            <div className="panel list-panel">

              <div className="list-header">
                <div>
                  <div className="section-kicker">YOUR COLLECTION</div>

                  <h2>
                    Course library{' '}
                    <span className="count-pill">{courses.length}</span>
                  </h2>

                  <p>
                    Browse your saved courses and manage each record.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-refresh"
                  onClick={() => loadCourses()}
                  disabled={loading}
                  title="Refresh list"
                >
                  ↻ <span className="d-none d-sm-inline">Refresh</span>
                </button>
              </div>

              <div className="search-wrap mb-3">
                <span className="search-symbol">⌕</span>

                <input
                  className="form-control"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, platform or ID…"
                  aria-label="Search courses"
                />
              </div>

              {loading ? (
                <div className="state-panel">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  />
                  <p>Loading your courses…</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="state-panel empty-state">
                  <div className="empty-illustration">▤</div>

                  <h3>
                    {courses.length === 0
                      ? 'Your library is empty'
                      : 'No matching courses'}
                  </h3>

                  <p>
                    {courses.length === 0
                      ? 'Add your first course with the form to get started.'
                      : 'Try another search term.'}
                  </p>

                  {search && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSearch('')}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive course-table-wrap">
                    <table className="table align-middle course-table">
                      <thead>
                        <tr>
                          <th>COURSE</th>
                          <th>DURATION</th>
                          <th>TYPE</th>
                          <th className="text-end">ACTIONS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCourses.map((course) => (
                          <tr key={course.id}>
                            <td>
                              <div className="course-title-cell">
                                <div className="course-avatar">
                                  {(course.title || '?')
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    className="course-title-button"
                                    onClick={() => viewCourse(course.id)}
                                  >
                                    {course.title}
                                  </button>

                                  <div className="course-subtitle">
                                    {course.platformName}{' '}
                                    <span className="id-subtitle">
                                      · ID {course.id}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="duration-value">
                                {course.durationHours}
                              </span>
                              <span className="duration-unit"> hrs</span>
                            </td>

                            <td>
                              <span
                                className={`type-badge ${
                                  course.paid ? 'type-paid' : 'type-free'
                                }`}
                              >
                                {course.paid ? 'Paid' : 'Free'}
                              </span>
                            </td>

                            <td>
                              <div className="table-actions justify-content-end">
                                <button
                                  type="button"
                                  className="action-btn view-action"
                                  aria-label={`View ${course.title}`}
                                  title="View details"
                                  onClick={() => viewCourse(course.id)}
                                >
                                  ⌕
                                </button>

                                <button
                                  type="button"
                                  className="action-btn edit-action"
                                  aria-label={`Edit ${course.title}`}
                                  title="Edit course"
                                  onClick={() => startEdit(course)}
                                >
                                  ✎
                                </button>

                                <button
                                  type="button"
                                  className="action-btn delete-action"
                                  aria-label={`Delete ${course.title}`}
                                  title="Delete course"
                                  onClick={() => deleteCourse(course)}
                                  disabled={deletingId === course.id}
                                >
                                  {deletingId === course.id ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    '×'
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="list-footer">
                    <span>
                      Showing <strong>{filteredCourses.length}</strong> of{' '}
                      <strong>{courses.length}</strong> courses
                    </span>

                    <span className="live-indicator">
                      <i /> API connected
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Individual course details dialog */}
        {(loadingDetails || selectedCourse) && (
          <div
            className="detail-backdrop"
            role="presentation"
            onClick={() =>
              !loadingDetails && setSelectedCourse(null)
            }
          >
            <section
              className="detail-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="detail-close"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close details"
              >
                ×
              </button>

              {loadingDetails ? (
                <div className="state-panel">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  />
                  <p>Loading course details…</p>
                </div>
              ) : (
                selectedCourse && (
                  <>
                    <div className="detail-icon">
                      {(selectedCourse.title || '?')
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="section-kicker">
                      COURSE DETAILS · ID {selectedCourse.id}
                    </div>

                    <h2 id="detail-title">
                      {selectedCourse.title}
                    </h2>

                    <p className="detail-platform">
                      Provided by {selectedCourse.platformName}
                    </p>

                    <div className="detail-grid">
                      <div>
                        <span>Duration</span>
                        <strong>
                          {selectedCourse.durationHours} hours
                        </strong>
                      </div>

                      <div>
                        <span>Course type</span>
                        <strong>
                          {selectedCourse.paid ? 'Paid' : 'Free'}
                        </strong>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-primary flex-grow-1"
                        onClick={() => {
                          const current = selectedCourse;
                          setSelectedCourse(null);
                          startEdit(current);
                        }}
                      >
                        Edit course
                      </button>

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => setSelectedCourse(null)}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )
              )}
            </section>
          </div>
        )}

        <footer className="app-footer mt-5">
          <span>
            CourseHub <span className="footer-dot">•</span>{' '}
            Online Course CRUD
          </span>

          <span>React · Spring Boot · PostgreSQL · Docker</span>
        </footer>

      </main>
    </div>
  );
}

export default App;