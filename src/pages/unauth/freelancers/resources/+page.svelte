<script lang="ts">
    let resources = [
      { title: "Как оформить профиль", description: "Полезные советы по созданию привлекательного профиля." },
      { title: "Секреты успешной заявки", description: "Рекомендации, как писать качественные предложения." },
      { title: "Обучающие материалы", description: "Курсы, статьи и видео для повышения профессиональных навыков." }
    ];
  </script>
  
  <section class="py-16 bg-base-100 text-base-content">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Ресурсы и советы</h1>
      <div class="space-y-8">
        {#each resources as res}
          <div class="p-6 bg-base-200 border border-base-300 rounded shadow hover:shadow-lg transition">
            <h2 class="text-2xl font-semibold mb-2">{res.title}</h2>
            <p>{res.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  