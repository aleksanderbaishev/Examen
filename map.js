let map;
let currentMarkers = [];

// Update resource data
const resources = [
    {
        type: 'education',
        name: 'Moscow State University',
        coordinates: [55.702868, 37.530865],
        address: 'Leninskie Gory, 1, Moscow',
        hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
        phone: '+7 (495) 939-10-00',
        description: 'Leading university in Russia offering comprehensive Russian language programs',
        keywords: ['university', 'academic', 'russian courses']
    },
    {
        type: 'library',
        name: 'Foreign Languages Library',
        coordinates: [55.756994, 37.614087],
        address: 'Nikoloyamskaya St., 1, Moscow',
        hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
        phone: '+7 (495) 915-36-21',
        description: 'Specialized library with extensive collection of language learning materials',
        keywords: ['library', 'books', 'study materials']
    },
    {
        type: 'cafe',
        name: 'Linguist Cafe',
        coordinates: [55.758463, 37.643016],
        address: 'Pokrovka St., 27, Moscow',
        hours: 'Daily: 10:00 AM - 10:00 PM',
        phone: '+7 (495) 624-01-37',
        description: 'Language exchange cafe with regular conversation clubs and cultural events',
        keywords: ['cafe', 'conversation club', 'cultural exchange']
    },
    {
        type: 'community',
        name: 'International House Moscow',
        coordinates: [55.769452, 37.595384],
        address: 'Tverskaya St., 16/2, Moscow',
        hours: 'Mon-Sun: 9:00 AM - 9:00 PM',
        phone: '+7 (495) 935-87-12',
        description: 'Cultural center offering language exchange programs and cultural activities',
        keywords: ['cultural center', 'language exchange', 'events']
    },
    {
        type: 'courses',
        name: 'Elite Language Center',
        coordinates: [55.745068, 37.566374],
        address: 'Kutuzovsky Prospekt, 22, Moscow',
        hours: 'Mon-Fri: 8:00 AM - 9:00 PM, Sat: 10:00 AM - 6:00 PM',
        phone: '+7 (495) 287-45-90',
        description: 'Premium language school with individual and group lessons',
        keywords: ['language school', 'private lessons', 'group classes']
    },
    {
        type: 'cafe',
        name: 'Polyglot Club',
        coordinates: [55.741469, 37.626211],
        address: 'Pyatnitskaya St., 42, Moscow',
        hours: 'Daily: 11:00 AM - 11:00 PM',
        phone: '+7 (495) 953-62-48',
        description: 'Modern space for language practice and cultural exchange',
        keywords: ['language club', 'practice', 'cultural exchange']
    }
];

// Initialize map
ymaps.ready(init);

function init() {
    map = new ymaps.Map('map', {
        center: [55.751244, 37.618423],
        zoom: 13,
        controls: ['zoomControl', 'searchControl']
    });

    showResources();
    updateResourcesList(resources);
}

// Display resources on the map
function showResources(filter = 'all') {
    // Clear current markers
    currentMarkers.forEach(marker => map.geoObjects.remove(marker));
    currentMarkers = [];

    resources.forEach(resource => {
        if (filter === 'all' || resource.type === filter) {
            const marker = new ymaps.Placemark(resource.coordinates, {
                balloonContent: `
                    <h5>${resource.name}</h5>
                    <p>${resource.address}</p>
                `
            }, {
                preset: getPresetForType(resource.type)
            });

            marker.events.add('click', () => showResourceInfo(resource));
            map.geoObjects.add(marker);
            currentMarkers.push(marker);
        }
    });
}

// Get marker style based on resource type
function getPresetForType(type) {
    const presets = {
        education: 'islands#blueEducationIcon',
        library: 'islands#brownBookIcon',
        cafe: 'islands#greenCafeIcon',
        community: 'islands#orangeHomeIcon',
        courses: 'islands#violetCircleDotIcon'
    };
    return presets[type] || 'islands#blueCircleDotIcon';
}

// Display resource information
function showResourceInfo(resource) {
    const infoBlock = document.getElementById('resourceInfo');
    infoBlock.innerHTML = `
        <h5>${resource.name}</h5>
        <p><i class="bi bi-geo-alt"></i> ${resource.address}</p>
        <p><i class="bi bi-clock"></i> ${resource.hours}</p>
        <p><i class="bi bi-telephone"></i> ${resource.phone}</p>
        <p><i class="bi bi-info-circle"></i> ${resource.description}</p>
    `;
}

// Update HTML to display the list of places
function updateResourcesList(resources) {
    const listContainer = document.getElementById('resourcesList');
    listContainer.innerHTML = '';

    resources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'card mb-3 resource-card';
        card.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">${resource.name}</h6>
                <p class="card-text small mb-1">
                    <i class="bi bi-geo-alt"></i> ${resource.address}<br>
                    <i class="bi bi-clock"></i> ${resource.hours}
                </p>
                <button class="btn btn-sm btn-outline-primary" onclick="showResourceOnMap('${resource.name}')">
                    Show on map
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Function to show resource on the map
function showResourceOnMap(resourceName) {
    const resource = resources.find(r => r.name === resourceName);
    if (resource) {
        map.setCenter(resource.coordinates, 15);
        showResourceInfo(resource);
        
        // Highlight marker
        currentMarkers.forEach(marker => {
            if (marker.properties.get('resourceName') === resourceName) {
                marker.balloon.open();
            }
        });
    }
}

// Update search function
function searchResources() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredResources = resources.filter(resource => 
        resource.name.toLowerCase().includes(searchQuery) ||
        resource.description.toLowerCase().includes(searchQuery) ||
        resource.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
    );

    // Update markers on the map
    currentMarkers.forEach(marker => map.geoObjects.remove(marker));
    currentMarkers = [];

    // Show found resources
    filteredResources.forEach(resource => {
        const marker = new ymaps.Placemark(resource.coordinates, {
            balloonContent: `
                <h5>${resource.name}</h5>
                <p>${resource.address}</p>
            `,
            resourceName: resource.name
        }, {
            preset: getPresetForType(resource.type)
        });

        marker.events.add('click', () => showResourceInfo(resource));
        map.geoObjects.add(marker);
        currentMarkers.push(marker);
    });

    // Update resources list
    updateResourcesList(filteredResources);
}

// Update filter function
function filterResources() {
    const filterValue = document.getElementById('resourceType').value;
    const filteredResources = filterValue === 'all' ? 
        resources : 
        resources.filter(resource => resource.type === filterValue);
    
    showResources(filterValue);
    updateResourcesList(filteredResources);
} 