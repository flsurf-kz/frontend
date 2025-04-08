<script lang="ts">
    let stories = [
      { id: 1, name: "Иван", story: "Платформа помогла мне перейти на фриланс и зарабатывать больше, чем на обычной работе." },
      { id: 2, name: "Мария", story: "Я реализовала свои творческие проекты и получила множество положительных отзывов." }
    ];
  </script>
  
  <section class="py-16 bg-base-100 text-base-content">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Успешные истории</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {#each stories as s}
          <div class="p-6 bg-base-200 border border-base-300 rounded shadow hover:shadow-xl transition">
            <h2 class="text-2xl font-semibold mb-2">{s.name}</h2>
            <p>{s.story}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  