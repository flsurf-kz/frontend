<script lang="ts">
    // Локальные данные для демонстрации
    let reasons = [
      {
        id: 1,
        title: "Надёжность",
        description: "Мы тщательно отбираем исполнителей и гарантируем качество каждого проекта."
      },
      {
        id: 2,
        title: "Прозрачность",
        description: "Четкая система рейтингов и отзывов позволяет вам легко выбирать лучших специалистов."
      },
      {
        id: 3,
        title: "Экономия времени",
        description: "Быстрый подбор исполнителя и удобное управление проектом сэкономят ваши ресурсы."
      },
      {
        id: 4,
        title: "Поддержка 24/7",
        description: "Наша команда поддержки всегда готова помочь вам решить любые вопросы."
      }
    ];
  </script>
  
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Почему выбирают нас?</h1>
      <div class="space-y-8 max-w-4xl mx-auto">
        {#each reasons as reason (reason.id)}
          <div class="p-6 border rounded-lg shadow hover:shadow-xl transition">
            <h2 class="text-2xl font-bold mb-2 text-gray-800">{reason.title}</h2>
            <p class="text-gray-600">{reason.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  