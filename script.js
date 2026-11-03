
// ==========================================
// 1. SELECT HTML ELEMENTS
// ==========================================

const newNoteBtn = document.getElementById("newNoteBtn");
const notesList = document.getElementById("notesList");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const noteCategory = document.getElementById("noteCategory");

const searchInput = document.getElementById("searchInput");

const saveStatus = document.getElementById("saveStatus");
const wordCount = document.getElementById("wordCount");
const noteDate = document.getElementById("noteDate");

const pinBtn = document.getElementById("pinBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const deleteBtn = document.getElementById("deleteBtn");

const filterButtons = document.querySelectorAll(".filter-btn");
const categoryLinks = document.querySelectorAll(".category-link");
const workspaceLinks = document.querySelectorAll(".workspace-link");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPage = document.getElementById("settingsPage");
const notesPanel = document.querySelector(".notes-panel");
const editorPanel = document.querySelector(".editor-panel");
const totalNotes = document.getElementById("totalNotes");

// Find the theme selector in the Settings page
const themeSelect =
    document.getElementById("themeSelect") ||
    settingsPage?.querySelector("select");


// ==========================================
// 2. STORE NOTES
// ==========================================

let notes = JSON.parse(localStorage.getItem("notes")) || [

    {
        id: 1,
        title: "Welcome to NoteSpace",
        content: "Your thoughts deserve a beautiful space. Start writing your ideas here!",
        category: "Personal",
        pinned: false,
        favorite: false,
        updatedAt: new Date().toISOString()
    },

    {
        id: 2,
        title: "My Daily Goals",
        content: "Things I want to accomplish today...",
        category: "Personal",
        pinned: false,
        favorite: false,
        updatedAt: new Date().toISOString()
    },

    {
        id: 3,
        title: "Project Ideas",
        content: "Some interesting ideas for future projects...",
        category: "Ideas",
        pinned: false,
        favorite: false,
        updatedAt: new Date().toISOString()
    }

];

let activeNoteId = notes.length > 0 ? notes[0].id : null;

let currentFilter = "All";


// Give older notes default values where necessary

notes.forEach(note => {

    if (!note.category) note.category = "Personal";

    if (typeof note.pinned !== "boolean") note.pinned = false;

    if (typeof note.favorite !== "boolean") note.favorite = false;

    if (typeof note.title !== "string") note.title = "";

    if (typeof note.content !== "string") note.content = "";

    if (!note.updatedAt) {
        note.updatedAt = new Date().toISOString();
    }

});


// ==========================================
// 3. COUNT NOTES WITH CONTENT
// ==========================================

function updateTotalNotes() {

    const completedNotes = notes.filter(note => {

        return (
            (note.title || "").trim() !== "" ||
            (note.content || "").trim() !== ""
        );

    });

    if (totalNotes) {
        totalNotes.textContent = completedNotes.length;
    }

}


// ==========================================
// 4. SAVE NOTES
// ==========================================

function saveNotes() {

    localStorage.setItem("notes", JSON.stringify(notes));

    if (saveStatus) {
        saveStatus.textContent = "All changes saved";
    }

    updateTotalNotes();

}


// Save any updates made to older notes

saveNotes();


// ==========================================
// 5. LIGHT AND DARK MODE
// ==========================================

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }

    if (themeSelect) {
        themeSelect.value = theme === "dark" ? "Dark Mode" : "Light Mode";
    }

    localStorage.setItem("noteSpaceTheme", theme);

}


// Load the previously selected theme

const savedTheme = localStorage.getItem("noteSpaceTheme") || "light";

applyTheme(savedTheme);


// Respond when the user changes the theme

if (themeSelect) {

    themeSelect.addEventListener("change", () => {

        const selectedTheme = themeSelect.value.toLowerCase();

        applyTheme(
            selectedTheme.includes("dark") ? "dark" : "light"
        );

    });

}


// ==========================================
// 6. NAVIGATION BETWEEN NOTES AND SETTINGS
// ==========================================

function showNotesWorkspace() {

    settingsPage.classList.remove("show");

    notesPanel.style.display = "";
    editorPanel.style.display = "";

    settingsBtn.classList.remove("active");

}


function showSettingsPage() {

    notesPanel.style.display = "none";
    editorPanel.style.display = "none";

    settingsPage.classList.add("show");

    updateTotalNotes();

    workspaceLinks.forEach(link => {
        link.classList.remove("active");
    });

    categoryLinks.forEach(link => {
        link.classList.remove("active");
    });

    filterButtons.forEach(button => {
        button.classList.remove("active");
    });

    settingsBtn.classList.add("active");

}


// Settings button

settingsBtn.addEventListener("click", event => {

    event.preventDefault();

    showSettingsPage();

});


// Workspace navigation

workspaceLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        currentFilter = link.dataset.view;

        showNotesWorkspace();

        updateNavigation();

        displayNotes();

    });

});


// ==========================================
// 7. UPDATE NAVIGATION APPEARANCE
// ==========================================

function updateNavigation() {

    workspaceLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.view === currentFilter
        );

    });

    categoryLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.category === currentFilter
        );

    });

    filterButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.textContent.trim() === currentFilter
        );

    });

    settingsBtn.classList.remove("active");

}


// ==========================================
// 8. DISPLAY NOTES
// ==========================================

function displayNotes() {

    notesList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase();

    let filteredNotes = notes.filter(note => {

        const matchesSearch =
            (note.title || "").toLowerCase().includes(searchTerm) ||
            (note.content || "").toLowerCase().includes(searchTerm);

        let matchesFilter = true;


        if (currentFilter === "Starred") {

            matchesFilter = note.favorite;

        }

        else if (currentFilter === "Pinned") {

            matchesFilter = note.pinned;

        }

        else if (currentFilter === "Recent") {

            const sevenDaysAgo =
                Date.now() - (7 * 24 * 60 * 60 * 1000);

            matchesFilter =
                new Date(note.updatedAt).getTime() >= sevenDaysAgo;

        }

        else if (
            ["Work", "Study", "Ideas", "Personal"].includes(currentFilter)
        ) {

            matchesFilter = note.category === currentFilter;

        }

        return matchesSearch && matchesFilter;

    });


    // Show pinned notes first

    filteredNotes.sort((a, b) => {

        if (a.pinned !== b.pinned) {
            return Number(b.pinned) - Number(a.pinned);
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt);

    });


    // Show a message if no notes are found

    if (filteredNotes.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "No notes found.";

        notesList.appendChild(emptyMessage);

        return;

    }


    // Create note cards

    filteredNotes.forEach(note => {

        const card = document.createElement("div");

        card.className = "note-card";

        if (note.id === activeNoteId) {
            card.classList.add("active");
        }

        const title = document.createElement("h3");

        title.textContent = note.title || "Untitled Note";


        const content = document.createElement("p");

        content.textContent = note.content || "No content yet...";


        const date = document.createElement("small");

        date.textContent = new Date(
            note.updatedAt
        ).toLocaleDateString();


        card.appendChild(title);
        card.appendChild(content);
        card.appendChild(date);


        card.addEventListener("click", () => {

            activeNoteId = note.id;

            loadNote();

            displayNotes();

        });


        notesList.appendChild(card);

    });

}


// ==========================================
// 9. LOAD A NOTE INTO THE EDITOR
// ==========================================

function loadNote() {

    const activeNote = notes.find(
        note => note.id === activeNoteId
    );


    if (!activeNote) {

        noteTitle.value = "";
        noteContent.value = "";
        noteCategory.value = "Personal";

        noteDate.textContent = "Today";

        pinBtn.style.color = "#77798a";

        favoriteBtn.textContent = "☆";
        favoriteBtn.style.color = "#77798a";

        updateWordCount();

        return;

    }


    noteTitle.value = activeNote.title;

    noteContent.value = activeNote.content;

    noteCategory.value = activeNote.category || "Personal";


    noteDate.textContent = new Date(
        activeNote.updatedAt
    ).toLocaleDateString();


    pinBtn.style.color = activeNote.pinned
        ? "#7665dc"
        : "#77798a";


    favoriteBtn.textContent = activeNote.favorite
        ? "★"
        : "☆";


    favoriteBtn.style.color = activeNote.favorite
        ? "#7665dc"
        : "#77798a";


    updateWordCount();

}


// ==========================================
// 10. CREATE A NEW NOTE
// ==========================================

newNoteBtn.addEventListener("click", () => {

    const newNote = {

        id: Date.now(),

        title: "",

        content: "",

        category: "Personal",

        pinned: false,

        favorite: false,

        updatedAt: new Date().toISOString()

    };


    notes.unshift(newNote);

    activeNoteId = newNote.id;

    currentFilter = "All";

    showNotesWorkspace();

    updateNavigation();

    saveNotes();

    displayNotes();

    loadNote();

    noteTitle.focus();

});


// ==========================================
// 11. AUTOMATICALLY SAVE CHANGES
// ==========================================

function updateNote() {

    const activeNote = notes.find(
        note => note.id === activeNoteId
    );


    if (!activeNote) return;


    activeNote.title = noteTitle.value;

    activeNote.content = noteContent.value;

    activeNote.category = noteCategory.value;

    activeNote.updatedAt = new Date().toISOString();


    noteDate.textContent = new Date(
        activeNote.updatedAt
    ).toLocaleDateString();


    saveNotes();

    displayNotes();

    updateWordCount();

}


noteTitle.addEventListener("input", updateNote);

noteContent.addEventListener("input", updateNote);

noteCategory.addEventListener("change", updateNote);


// ==========================================
// 12. DELETE A NOTE
// ==========================================

deleteBtn.addEventListener("click", () => {

    if (!activeNoteId) return;


    const confirmDelete = confirm(
        "Are you sure you want to delete this note?"
    );


    if (!confirmDelete) return;


    notes = notes.filter(
        note => note.id !== activeNoteId
    );


    activeNoteId = notes.length > 0
        ? notes[0].id
        : null;


    saveNotes();

    displayNotes();

    loadNote();

});


// ==========================================
// 13. PIN A NOTE
// ==========================================

pinBtn.addEventListener("click", () => {

    const activeNote = notes.find(
        note => note.id === activeNoteId
    );


    if (!activeNote) return;


    activeNote.pinned = !activeNote.pinned;

    saveNotes();

    loadNote();

    displayNotes();

});


// ==========================================
// 14. FAVOURITE A NOTE
// ==========================================

favoriteBtn.addEventListener("click", () => {

    const activeNote = notes.find(
        note => note.id === activeNoteId
    );


    if (!activeNote) return;


    activeNote.favorite = !activeNote.favorite;

    saveNotes();

    loadNote();

    displayNotes();

});


// ==========================================
// 15. SEARCH NOTES
// ==========================================

searchInput.addEventListener("input", displayNotes);


// ==========================================
// 16. FILTER NOTES
// ==========================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.textContent.trim();

        showNotesWorkspace();

        updateNavigation();

        displayNotes();

    });

});


// ==========================================
// 17. CATEGORY NAVIGATION
// ==========================================

categoryLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        currentFilter = link.dataset.category;

        showNotesWorkspace();

        updateNavigation();

        displayNotes();

    });

});


// ==========================================
// 18. COUNT WORDS AND CHARACTERS
// ==========================================

function updateWordCount() {

    const text = noteContent.value.trim();

    const words = text === ""
        ? 0
        : text.split(/\s+/).length;

    const characters = noteContent.value.length;


    wordCount.textContent =
        words + " words · " + characters + " characters";

}


// ==========================================
// 19. TEXT FORMATTING
// ==========================================

const formatButtons = document.querySelectorAll(
    ".formatting-toolbar button"
);


formatButtons.forEach((button, index) => {

    button.addEventListener("click", () => {

        const start = noteContent.selectionStart;

        const end = noteContent.selectionEnd;

        const selectedText = noteContent.value.substring(
            start,
            end
        );


        let formattedText = selectedText;


        if (index === 0) {

            formattedText = `**${selectedText}**`;

        }

        else if (index === 1) {

            formattedText = `*${selectedText}*`;

        }

        else if (index === 2) {

            formattedText = `_${selectedText}_`;

        }

        else if (index === 3) {

            formattedText = `• ${selectedText}`;

        }


        noteContent.setRangeText(
            formattedText,
            start,
            end,
            "select"
        );


        noteContent.focus();

        updateNote();

    });

});


// ==========================================
// 20. START THE APPLICATION
// ==========================================

displayNotes();

loadNote();

updateTotalNotes();
