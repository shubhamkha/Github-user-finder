// DOM Elements
const searchForm = document.getElementById("searchForm");
const usernameInp = document.querySelector(".usernameinp");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

async function getProfileData(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error("User not found");
    return await response.json();
}

async function getRepos(username) {
    const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
    );
    if (!response.ok) throw new Error("Failed to fetch repositories");
    return await response.json();
}

function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
    results.innerHTML = "";
}

function createRepoCard(repo) {
    return `
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-500 transition-all">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-lg">
                        <a href="${repo.html_url}" target="_blank" class="text-blue-600 hover:underline">
                            ${repo.name}
                        </a>
                    </h3>
                    ${repo.description ? `<p class="text-gray-600 mt-2">${repo.description}</p>` : ""}
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-600">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="text-gray-600">
                        <i class="fas fa-code-branch"></i> ${repo.forks_count}
                    </span>
                </div>
            </div>
        </div>
    `;
}

function createProfileCard(details, repos) {
    return `
        <div class="space-y-8">
            <!-- Profile Section -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200">
                    <img src="${details.avatar_url}" alt="${details.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 space-y-2">
                    <h2 class="text-2xl font-bold">${details.name || details.login}</h2>
                    <p class="text-gray-600">${details.bio || "No bio available"}</p>
                    
                    <div class="flex flex-wrap gap-4 mt-4">
                        ${details.location ? `
                            <div class="flex items-center gap-2 text-gray-600">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${details.location}</span>
                            </div>
                        ` : ""}
                        
                        ${details.company ? `
                            <div class="flex items-center gap-2 text-gray-600">
                                <i class="fas fa-building"></i>
                                <span>${details.company}</span>
                            </div>
                        ` : ""}
                    </div>

                    <div class="flex flex-wrap gap-4 mt-4 text-sm">
                        <div class="bg-blue-100 px-4 py-2 rounded-full">
                            Repositories: <strong>${details.public_repos}</strong>
                        </div>
                        <div class="bg-green-100 px-4 py-2 rounded-full">
                            Followers: <strong>${details.followers}</strong>
                        </div>
                        <div class="bg-purple-100 px-4 py-2 rounded-full">
                            Following: <strong>${details.following}</strong>
                        </div>
                    </div>

                    ${details.blog ? `
                        <div class="mt-4">
                            <a href="${details.blog.startsWith("http") ? details.blog : `https://${details.blog}`}" 
                               target="_blank"
                               class="text-blue-600 hover:underline flex items-center gap-2">
                                <i class="fas fa-link"></i>
                                ${details.blog}
                            </a>
                        </div>
                    ` : ""}
                </div>
            </div>

            <!-- Repositories Section -->
            <div class="space-y-4">
                <h3 class="text-xl font-bold">Latest Repositories</h3>
                <div class="grid gap-4">
                    ${repos.map(repo => createRepoCard(repo)).join("")}
                </div>
            </div>
        </div>
    `;
}

async function handleSearch(e) {
    e.preventDefault();
    const username = usernameInp.value.trim();
    
    if (!username) {
        showError("Please enter a GitHub username");
        return;
    }

    try {
        error.classList.add("hidden");
        loading.classList.remove("hidden");
        results.innerHTML = "";

        const [profile, repos] = await Promise.all([
            getProfileData(username),
            getRepos(username)
        ]);

        results.innerHTML = createProfileCard(profile, repos);
    } catch (err) {
        showError(err.message);
    } finally {
        loading.classList.add("hidden");
    }
}

searchForm.addEventListener("submit", handleSearch);