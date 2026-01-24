<script lang="ts">
    let steps = [
      { id: 1, title: "Создай профиль", description: "Заполни информацию о себе и своих навыках." },
      { id: 2, title: "Находи проекты", description: "Просматривай заказы и подавай заявки на те, что подходят." },
      { id: 3, title: "Работай и зарабатывай", description: "Выполняй проекты, получай отзывы и зарабатывай." }
    ];
  </script>
  
  <section class="py-16 bg-base-100 text-base-content">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Как это работает для фрилансеров</h1>
      <div class="space-y-8">
        {#each steps as step}
          <div class="p-6 bg-base-200 border border-base-300 rounded-lg shadow hover:shadow-lg transition">
            <h2 class="text-2xl font-bold mb-2">Шаг {step.id}: {step.title}</h2>
            <p class="text-lg">{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  