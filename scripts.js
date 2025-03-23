const API_KEY = '737a2d8a-5732-4983-a109-60dfb5a6fde4';
const BASE_URL = 'http://cat-facts-api.std-900.ist.mospolytech.ru/api';

// Function to display notifications
function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Loading courses
async function loadCourses(page = 1, searchQuery = '', level = '') {
    try {
        const response = await fetch(`${BASE_URL}/courses?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Error loading data');
        }

        let courses = await response.json();
        
        if (!Array.isArray(courses)) {
            throw new Error('Invalid data format');
        }

        // Apply filters
        if (searchQuery || level) {
            courses = courses.filter(course => {
                const matchesSearch = searchQuery ? 
                    (course.name.toLowerCase().includes(searchQuery) || 
                     course.description.toLowerCase().includes(searchQuery)) : 
                    true;
                
                const matchesLevel = level ? 
                    course.level.toLowerCase() === level.toLowerCase() : 
                    true;

                return matchesSearch && matchesLevel;
            });
        }

        const coursesList = document.getElementById('coursesList');
        coursesList.innerHTML = '';

        if (courses.length === 0) {
            coursesList.innerHTML = '<div class="col-12 text-center">Courses not found</div>';
        } else {
            courses.forEach(course => {
                const courseElement = createCourseElement(course);
                coursesList.appendChild(courseElement);
            });
        }
    } catch (error) {
        showNotification('Error loading courses', 'danger');
        console.error('Error:', error);
    }
}

// Creating a course element
function createCourseElement(course) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
        <div class="card course-card h-100 shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">${course.name}</h5>
            </div>
            <div class="card-body">
                <p class="card-text">${course.description}</p>
                <div class="course-info">
                    <div class="info-item">
                        <class="bi bi-person-fill"></i>
                        <span>Teacher: ${course.teacher}</span>
                    </div>
                    <div class="info-item">
                        <class="bi bi-bar-chart-fill"></i>
                        <span>Level: ${course.level}</span>
                    </div>
                    <div class="info-item">
                        <class="bi bi-clock-fill"></i>
                        <span>Duration: ${course.total_length * course.week_length} h.</span>
                    </div>
                    <div class="info-item price">
                        <class="bi bi-cash"></i>
                        <span>${course.course_fee_per_hour}₽/hour</span>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white border-0 text-center">
                <button class="btn btn-primary w-100" onclick="openOrderModal(${course.id})">
                    Enroll
                </button>
            </div>
        </div>
    `;
    return col;
}

// Searching for courses
function searchCourses() {
    const searchQuery = document.getElementById('courseSearch').value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter').value;
    loadCourses(1, searchQuery, levelFilter);
}

// Loading tutors
async function loadTutors(level = '') {
    try {
        const response = await fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error loading data');
        }

        let tutors = await response.json();
        
        // Apply filter by level
        if (level) {
            tutors = tutors.filter(tutor => 
                tutor.language_level.toLowerCase() === level.toLowerCase()
            );
        }

        const tutorsList = document.getElementById('tutorsList');
        tutorsList.innerHTML = '';

        if (tutors.length === 0) {
            tutorsList.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Tutors not found</td>
                </tr>
            `;
        } else {
            tutors.forEach(tutor => {
                const tutorElement = createTutorElement(tutor);
                tutorsList.appendChild(tutorElement);
            });
        }
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Creating a tutor element
function createTutorElement(tutor) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
        <div class="card tutor-card h-100 shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">${tutor.name}</h5>
            </div>
            <div class="card-body">
                <div class="tutor-info">
                    <div class="info-item">
                        <class="bi bi-mortarboard-fill"></i>
                        <span>Level: ${tutor.language_level}</span>
                    </div>
                    <div class="info-item">
                        <class="bi bi-translate"></i>
                        <span>Languages: ${tutor.languages_spoken.join(', ')}</span>
                    </div>
                    <div class="info-item">
                        <class="bi bi-briefcase-fill"></i>
                        <span>Experience: ${tutor.work_experience} years</span>
                    </div>
                    <div class="info-item price">
                        <class="bi bi-cash"></i>
                        <span>${tutor.price_per_hour}₽/hour</span>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white border-0 text-center">
                <button class="btn btn-primary w-100" onclick="openOrderModal(${tutor.id}, true)">
                    Select
                </button>
            </div>
        </div>
    `;
    return col;
}

// Opening the order modal
async function openOrderModal(id, isTutor = false) {
    try {
        const response = await fetch(`${BASE_URL}/${isTutor ? 'tutors' : 'courses'}/${id}?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error loading data');
        }

        const data = await response.json();
        const form = document.getElementById('orderForm');
        
        // Save data in the form
        form.dataset.id = id;
        form.dataset.type = isTutor ? 'tutor' : 'course';
        form.dataset.basePrice = isTutor ? data.price_per_hour : data.course_fee_per_hour;
        form.dataset.duration = isTutor ? 1 : (data.total_length * data.week_length);
        
        // Fill the form with data
        document.getElementById('courseName').value = data.name;
        
        // Clear and fill time slots
        const startTimeSelect = document.getElementById('startTime');
        startTimeSelect.innerHTML = '';
        
        // Standard time slots for all types of registration
        const timeSlots = [
            '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
            '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
        ];
        
        timeSlots.forEach(time => {
            const timeOption = document.createElement('option');
            timeOption.value = time;
            timeOption.textContent = time;
            startTimeSelect.appendChild(timeOption);
        });

        // Set the minimum date
        const dateInput = document.getElementById('startDate');
        const today = new Date();
        today.setDate(today.getDate() + 1); // Minimum the next day
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.value = today.toISOString().split('T')[0];

        // Reset other form fields
        document.getElementById('studentsCount').value = 1;
        document.getElementById('supplementary').checked = false;
        calculateTotalPrice(); // Recalculate the cost

        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        modal.show();
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Updating the price calculation function
function calculateTotalPrice() {
    const form = document.getElementById('orderForm');
    const basePrice = parseFloat(form.dataset.basePrice);
    const studentsCount = parseInt(document.getElementById('studentsCount').value) || 0;
    const duration = parseInt(form.dataset.duration) || 1;
    let totalPrice = basePrice * studentsCount * duration;

    // Automatic discounts
    const startDate = new Date(document.getElementById('startDate').value);
    const currentDate = new Date();
    const monthDiff = startDate.getMonth() - currentDate.getMonth() + 
        (12 * (startDate.getFullYear() - currentDate.getFullYear()));
    
    let discountText = [];
    let extraChargesText = [];

    // Early registration (a month in advance)
    if (monthDiff >= 1) {
        totalPrice *= 0.9; // 10% discount
        discountText.push('Early registration discount: -10%');
    }

    // Group enrollment (5 or more people)
    if (studentsCount >= 5) {
        totalPrice *= 0.85; // 15% discount
        discountText.push('Group discount: -15%');
        document.getElementById('groupDiscount').style.display = 'block';
    } else {
        document.getElementById('groupDiscount').style.display = 'none';
    }

    // Additional options
    // Intensive course
    if (document.getElementById('intensiveCourse').checked) {
        totalPrice *= 1.2;
        extraChargesText.push('Intensive course: +20%');
    }

    // Supplementary materials
    if (document.getElementById('supplementary').checked) {
        totalPrice += 2000 * studentsCount;
        extraChargesText.push(`Supplementary materials: +${2000 * studentsCount}₽`);
    }

    // Personalized lessons
    if (document.getElementById('personalized').checked) {
        const weeksCount = Math.ceil(duration / 7);
        totalPrice += 1500 * weeksCount;
        extraChargesText.push(`Personalized lessons: +${1500 * weeksCount}₽`);
    }

    // Cultural excursions
    if (document.getElementById('excursions').checked) {
        totalPrice *= 1.25;
        extraChargesText.push('Cultural excursions: +25%');
    }

    // Level assessment
    if (document.getElementById('assessment').checked) {
        totalPrice += 300;
        extraChargesText.push('Level assessment: +300₽');
    }

    // Interactive platform
    if (document.getElementById('interactive').checked) {
        totalPrice *= 1.5;
        extraChargesText.push('Interactive platform: +50%');
    }

    // Update discount information
    const discountsBlock = document.getElementById('autoDiscounts');
    let discountsHtml = '';
    
    if (discountText.length > 0) {
        discountsHtml += '<h6>Applied discounts:</h6><ul class="mb-0">';
        discountText.forEach(text => {
            discountsHtml += `<li>${text}</li>`;
        });
        discountsHtml += '</ul>';
    }
    
    if (extraChargesText.length > 0) {
        if (discountsHtml) discountsHtml += '<hr>';
        discountsHtml += '<h6>Additional services:</h6><ul class="mb-0">';
        extraChargesText.forEach(text => {
            discountsHtml += `<li>${text}</li>`;
        });
        discountsHtml += '</ul>';
    }
    
    discountsBlock.innerHTML = discountsHtml;
    discountsBlock.style.display = discountsHtml ? 'block' : 'none';

    // Update price display
    document.getElementById('totalPrice').value = `${Math.round(totalPrice)}₽`;
    return Math.round(totalPrice);
}

// Submitting the order
async function submitOrder() {
    try {
        const form = document.getElementById('orderForm');
        const studentsCount = parseInt(document.getElementById('studentsCount').value);
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;

        if (!startDate || !startTime || !studentsCount) {
            throw new Error('Please fill in all required fields');
        }
        
        // Basic order data
        const formData = {
            [form.dataset.type === 'tutor' ? 'tutor_id' : 'course_id']: parseInt(form.dataset.id),
            date_start: startDate,
            time_start: startTime,
            persons: studentsCount,
            duration: form.dataset.type === 'tutor' ? 1 : parseInt(form.dataset.duration),
            
            // Additional options
            supplementary: document.getElementById('supplementary').checked,
            early_registration: false,
            group_enrollment: studentsCount >= 5,
            intensive_course: false,
            personalized: false,
            excursions: false,
            assessment: false,
            interactive: false,
            
            // Price calculation
            price: calculateTotalPrice()
        };

        // Check for early registration (a month in advance)
        const orderDate = new Date(startDate);
        const currentDate = new Date();
        const monthDiff = orderDate.getMonth() - currentDate.getMonth() + 
            (12 * (orderDate.getFullYear() - currentDate.getFullYear()));
        formData.early_registration = monthDiff >= 1;

        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error sending order');
        }

        showNotification('Order successfully sent');
        bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Updating initialization on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
    loadTutors();
    
    // Event handlers for price calculation
    document.getElementById('studentsCount').addEventListener('input', calculateTotalPrice);
    document.getElementById('supplementary').addEventListener('change', calculateTotalPrice);
    
    // Event handlers for course search (instant search on input)
    document.getElementById('courseSearch').addEventListener('input', () => searchCourses());
    document.getElementById('levelFilter').addEventListener('change', () => searchCourses());
    
    // Event handler for tutor search
    document.getElementById('tutorLevel').addEventListener('change', () => {
        const level = document.getElementById('tutorLevel').value;
        loadTutors(level);
    });
    
    // Prevent form submission
    document.getElementById('courseSearchForm').addEventListener('submit', (e) => e.preventDefault());
    document.getElementById('tutorSearchForm').addEventListener('submit', (e) => e.preventDefault());

    // Add event listeners for all options
    const options = [
        'intensiveCourse', 'supplementary', 'personalized',
        'excursions', 'assessment', 'interactive'
    ];
    
    options.forEach(option => {
        document.getElementById(option)?.addEventListener('change', calculateTotalPrice);
    });
}); 
