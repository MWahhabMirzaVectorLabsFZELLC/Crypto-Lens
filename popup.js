document.addEventListener('DOMContentLoaded', async () => {
    const cryptoList = document.getElementById('crypto-list');
    const favoritesList = document.getElementById('favorites-list');
    const showFavorites = document.getElementById('show-favorites');
    const showCryptos = document.getElementById('show-cryptos');
    const addMoreButton = document.getElementById('add-more');
    const favoritesCount = document.getElementById('favorites-count');

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    async function fetchData() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }

    function updateFavorites() {
        const favoritesTableBody = favoritesList.querySelector('#favorites-table-body');
        favoritesTableBody.innerHTML = '';
        if (favorites.length === 0) {
            favoritesTableBody.innerHTML = '<tr><td colspan="4">No favorites found.</td></tr>';
            favoritesCount.textContent = 'Favorites: 0';
            return;
        }
        favorites.forEach(coin => {
            const row = document.createElement('tr');
            row.dataset.id = coin.id;
            row.innerHTML = `
                <td><img src="${coin.image}" alt="${coin.name} icon" style="width: 24px; height: 24px;"></td>
                <td>${coin.symbol.toUpperCase()}</td>
                <td>${coin.name}</td>
                <td>$${coin.current_price.toFixed(2)}</td>
            `;
            row.addEventListener('click', () => {
                // Remove coin from favorites on click
                favorites = favorites.filter(fav => fav.id !== coin.id);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavorites(); // Re-render the favorites list
                displayCryptos(); // Re-render the cryptos list to update favorite status
            });
            favoritesTableBody.appendChild(row);
        });
        favoritesCount.textContent = `Favorites: ${favorites.length}`;
    }

    function displayCryptos(data) {
        const cryptoTableBody = document.getElementById('crypto-table-body');
        cryptoTableBody.innerHTML = '';
        data.forEach((coin) => {
            const row = document.createElement('tr');
            row.dataset.id = coin.id;
            row.innerHTML = `
                <td><img src="${coin.image}" alt="${coin.name} icon" style="width: 24px; height: 24px;"></td>
                <td>${coin.symbol.toUpperCase()}</td>
                <td>${coin.market_cap_rank}</td>
                <td>${coin.name}</td>
            `;
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                const isFavorite = favorites.some(fav => fav.id === id);
                if (isFavorite) {
                    favorites = favorites.filter(fav => fav.id !== id);
                } else {
                    const coinToAdd = data.find(coin => coin.id === id);
                    favorites.push(coinToAdd);
                }
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavorites();
                displayCryptos(data); // Re-render cryptos to update favorite status
            });
            cryptoTableBody.appendChild(row);
        });
    }

    async function initialize() {
        const data = await fetchData();
        displayCryptos(data);
        updateFavorites();
    }

    async function handleAddMore() {
        favoritesList.style.display = 'none';
        cryptoList.style.display = 'block';
        // Fetch and display crypto data
        const data = await fetchData();
        displayCryptos(data);
    }

    initialize();

   

    addMoreButton.addEventListener('click', handleAddMore);
});
