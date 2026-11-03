
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

const formatButtons = document.querySelectorAll(
    ".formatting-toolbar button"
);

const filterButtons = document.querySelectorAll(".filter-btn");
const categoryLinks = document.querySelectorAll(".category-link");
const workspaceLinks = document.querySelectorAll(".workspace-link");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPage = document.getElementById("settingsPage");
const notesPanel = document.querySelector(".notes-panel");
const editorPanel = document.querySelector(".editor-panel");
const totalNotes = document.getElementById("totalNotes");

const themeSelect =
    document.getElementById("themeSelect") ||
    settingsPage?.querySelector("select");


// ==========================================
// 2. STORE NOTES
// ==========================================

// Only create sample notes when there is no saved data.
// An intentionally empty notes array stays empty.

const savedNotes = localStorage.getItem("notes");

let notes = savedNotes !== null
    ? JSON.parse(savedNotes)
    : [
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


// Give older notes default values

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
// 3. HELPER FUNCTIONS FOR NOTE CONTENT
// ==========================================

// Get ordinary text from the rich-text editor.
// This is useful for searching and counting words.

function getPlainText(html) {

    const temporaryElement = document.createElement("div");

    temporaryElement.innerHTML = html;

    return temporaryElement.textContent || "";

}


// Clean saved HTML before displaying it.
// Only basic formatting tags are allowed.

function cleanNoteHTML(html) {

    const template = document.createElement("template");

    template.innerHTML = html;

    const allowedTags = [
        "B", "STRONG", "I", "EM", "U",
        "UL", "OL", "LI", "P", "BR", "DIV"
    ];

    const dangerousTags = [
        "SCRIPT", "STYLE", "IFRAME",
        "OBJECT", "EMBED"
    ];

    template.content.querySelectorAll("*").forEach(element => {

        if (dangerousTags.includes(element.tagName)) {
            element.remove();
            return;
        }

        if (!allowedTags.includes(element.tagName)) {

            element.replaceWith(
                document.createTextNode(element.textContent)
            );

            return;

        }

        // Remove attributes such as onclick and style.
        Array.from(element.attributes).forEach(attribute => {
            element.removeAttribute(attribute.name);
        });

    });

    return template.innerHTML;

}


// Load content safely.
// Old notes containing ordinary text are preserved.

function displayNoteContent(content) {

    const looksLikeRichText =
        /<\/?(b|strong|i|em|u|ul|ol|li|p|br|div)(\s|>|\/)/i.test(content);

    if (looksLikeRichText) {

        noteContent.innerHTML = cleanNoteHTML(content);

    } else {

        noteContent.textContent = content;

    }

}


// ==========================================
// 4. COUNT NOTES
// ==========================================

function updateTotalNotes() {

    const completedNotes = notes.filter(note => {

        return (
            note.title.trim() !== "" ||
            getPlainText(note.content).trim() !== ""
        );

    });

    if (totalNotes) {
        totalNotes.textContent = completedNotes.length;
    }

}


// ==========================================
// 5. SAVE NOTES
// ==========================================

function saveNotes() {

    localStorage.setItem("notes", JSON.stringify(notes));

    if (saveStatus) {
        saveStatus.textContent = "All changes saved";
    }

    updateTotalNotes();

}

saveNotes();


// ==========================================
// 6. LIGHT AND DARK MODE
// ==========================================

function applyTheme(theme) {

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    if (themeSelect) {
        themeSelect.value =
            theme === "dark" ? "Dark Mode" : "Light Mode";
    }

    localStorage.setItem("noteSpaceTheme", theme);

}

const savedTheme = localStorage.getItem("noteSpaceTheme") || "light";

applyTheme(savedTheme);


if (themeSelect) {

    themeSelect.addEventListener("change", () => {

        const selectedTheme = themeSelect.value.toLowerCase();

        applyTheme(
            selectedTheme.includes("dark") ? "dark" : "light"
        );

    });

}


// ==========================================
// 7. NAVIGATION BETWEEN NOTES AND SETTINGS
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


settingsBtn.addEventListener("click", event => {

    event.preventDefault();

    showSettingsPage();

});


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
// 8. UPDATE NAVIGATION APPEARANCE
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
// 9. DISPLAY NOTES
// ==========================================

function displayNotes() {

    notesList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase();

    let filteredNotes = notes.filter(note => {

        const plainContent = getPlainText(note.content);

        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm) ||
            plainContent.toLowerCase().includes(searchTerm);

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


    // Pinned notes appear first

    filteredNotes.sort((a, b) => {

        if (a.pinned !== b.pinned) {
            return Number(b.pinned) - Number(a.pinned);
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt);

    });


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

        content.textContent =
            getPlainText(note.content) || "No content yet...";


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
// 10. LOAD A NOTE INTO THE EDITOR
// ==========================================

function loadNote() {

    const activeNote = notes.find(
        note => note.id === activeNoteId
    );


    if (!activeNote) {

        noteTitle.value = "";

        noteContent.innerHTML = "";

        noteCategory.value = "Personal";

        noteDate.textContent = "Today";

        pinBtn.style.color = "#77798a";

        favoriteBtn.textContent = "☆";

        favoriteBtn.style.color = "#77798a";

        updateWordCount();

        return;

    }


    noteTitle.value = activeNote.title;

    displayNoteContent(activeNote.content);

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
// 11. CREATE A NEW NOTE
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
// 12. AUTOMATICALLY SAVE CHANGES
// ==========================================

function updateNote() {

    const activeNote = notes.find(
        note => note.id === activeNoteId
    );

    if (!activeNote) return;


    activeNote.title = noteTitle.value;

    // Save the formatting as HTML

    activeNote.content = noteContent.innerHTML;

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
// 13. DELETE A NOTE
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
// 14. PIN A NOTE
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
// 15. FAVOURITE A NOTE
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
// 16. SEARCH NOTES
// ==========================================

searchInput.addEventListener("input", displayNotes);


// ==========================================
// 17. FILTER NOTES
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
// 18. CATEGORY NAVIGATION
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
// 19. COUNT WORDS AND CHARACTERS
// ==========================================

function updateWordCount() {

    const text = noteContent.innerText.trim();

    const words = text === ""
        ? 0
        : text.split(/\s+/).length;

    const characters = text.length;


    wordCount.textContent =
        words + " words · " + characters + " characters";

}


// ==========================================
// 20. TEXT FORMATTING
// ==========================================

// Keep the text selection when clicking a toolbar button.

formatButtons.forEach(button => {

    button.addEventListener("mousedown", event => {
        event.preventDefault();
    });

});


formatButtons.forEach(button => {

    button.addEventListener("click", () => {

        const command = button.dataset.command;

        if (!command) return;

        noteContent.focus();

        document.execCommand(command, false, null);

        updateNote();

        updateWordCount();

    });

});


// ==========================================
// 21. START THE APPLICATION
// ==========================================

displayNotes();

loadNote();

updateTotalNotes();
