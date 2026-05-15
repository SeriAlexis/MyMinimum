self.addEventListener('fetch', (event) => {
    // пока ничего не кешируем, просто даём браузеру загрузить как обычно
    event.respondWith(fetch(event.request));
});