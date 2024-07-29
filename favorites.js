document.addEventListener('DOMContentLoaded', async () => {
    const favoritesList = document.getElementById('favorites-list');
    const favoritesCount = document.getElementById('favorites-count');

    // Retrieve favorites from localStorage (coin objects)
    let storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log('Stored favorites:', storedFavorites); // Debugging line

    // Function to display favorites in a table
    function displayFavorites(data) {
        favoritesList.innerHTML = '';
        if (data.length === 0) {
            favoritesList.innerHTML = '<p>No favorites found.</p>';
            favoritesCount.textContent = 'Favorites: 0';
            return;
        }

        // Create table
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Icon</th>
                    <th>Symbol</th>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Market Price</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(coin => `
                    <tr data-id="${coin.id}">
                        <td><img src="${coin.image}" alt="${coin.name} icon" style="width: 24px; height: 24px;"></td>
                        <td>${coin.symbol.toUpperCase()}</td>
                        <td>${coin.market_cap_rank}</td>
                        <td>${coin.name}</td>
                        <td>$${coin.current_price.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        favoritesList.appendChild(table);

        // Add click event listener to each row for removing the coin
        table.querySelectorAll('tr[data-id]').forEach(row => {
            row.addEventListener('click', () => {
                const coinId = row.getAttribute('data-id');
                removeFavorite(coinId);
            });
        });

        // Update the header with the count of displayed favorites
        favoritesCount.textContent = `Favorites: ${data.length}`;
    }

    // Function to remove a coin from favorites
    function removeFavorite(coinId) {
        storedFavorites = storedFavorites.filter(coin => coin.id !== coinId);
        localStorage.setItem('favorites', JSON.stringify(storedFavorites));
        // Refresh the displayed favorites
        fetchData();
    }

    // Fetch data for the favorites
    async function fetchData() {
        try {
            // Extract IDs from stored favorites
            const ids = storedFavorites.map(coin => coin.id).join(',');
            console.log('Fetching data for IDs:', ids); // Debugging line

            if (!ids) {
                displayFavorites([]);
                return;
            }

            // Use `ids` parameter to request data for specific coins
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=15&page=1&sparkline=false`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Fetched data:', data); // Debugging line
            displayFavorites(data);
        } catch (error) {
            console.error('Fetch error:', error);
            favoritesList.innerHTML = '<p>Error fetching data</p>';
            favoritesCount.textContent = 'Favorites: 0';
        }
    }

    fetchData();
});
