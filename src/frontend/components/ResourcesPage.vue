<template>
  <section class="resources-page">
    <div class="resources-hero">
      <p class="hero-badge">Trusted Sources</p>
      <h1>Research, without the waffle.</h1>
      <p class="hero-description">
        Quick, useful takeaways from the research behind SunSafety and why it matters in real life.
      </p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input
          v-model="searchText"
          type="text"
          placeholder="Search sources..."
        />
      </div>

      <div class="filter-buttons">
        <button
          v-for="filter in filters"
          :key="filter"
          :class="['filter-btn', { active: selectedFilter === filter }]"
          @click="selectedFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <div class="results-summary">
      <p>{{ filteredResources.length }} resource<span v-if="filteredResources.length !== 1">s</span> found</p>
    </div>

    <div v-if="filteredResources.length" class="resources-grid">
      <article
        v-for="resource in filteredResources"
        :key="resource.id"
        class="resource-card"
      >
        <div class="postcard-corner" aria-hidden="true"></div>

        <div class="card-header">
          <span class="category">{{ resource.category }}</span>
          <span class="year">{{ resource.year }}</span>
        </div>

        <h2 class="resource-title">{{ resource.title }}</h2>
        <p class="resource-source">{{ resource.source }}</p>

        <p class="resource-summary">
          {{ resource.summary }}
        </p>

        <div class="why-box">
          <h3>What this means for you</h3>
          <p>{{ resource.whyItMatters }}</p>
        </div>

        <a
          :href="resource.link"
          target="_blank"
          rel="noopener noreferrer"
          class="learn-more-btn"
        >
          Read Source
        </a>
      </article>
    </div>

    <div v-else class="empty-state">
      <h3>No resources matched your search</h3>
      <p>Try a different keyword or filter.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const searchText = ref('')
const selectedFilter = ref('All')

const filters = ['All', 'Research', 'Survey', 'Guideline', 'Article']

const resources = [
  {
    id: 1,
    category: 'Research',
    year: '2021',
    title: 'Sun-health behaviours and attitudes towards sun safety amongst Australian teenagers',
    source: 'BioMed Central Research Notes',
    summary:
      'This study explores how Australian teenagers think about sun safety, tanning and protective behaviour.',
    whyItMatters:
      'Knowing the risk is not enough on its own, so people need a simple next step before they head outside.',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8425089/'
  },
  {
    id: 2,
    category: 'Research',
    year: '2023',
    title: 'Patterns of Sun Protection Behaviours among Australian Adolescents and Adults over a Six-Year Period',
    source: 'Current Oncology',
    summary:
      'This paper looks at how sun protection behaviour changes over time across different age groups in Australia.',
    whyItMatters:
      'Good habits slip, so quick UV checks and regular reminders work better than one big warning.',
    link: 'https://www.mdpi.com/1718-7729/30/8/520'
  },
  {
    id: 3,
    category: 'Survey',
    year: '2024',
    title: 'Sun protection behaviours, Nov 2023 to Feb 2024',
    source: 'Australian Bureau of Statistics',
    summary:
      'This report presents Australian data on how people use sunscreen, hats and other protective measures during sunny periods.',
    whyItMatters:
      'A lot of people still miss the basics, so prompts about sunscreen, hats, and shade still matter.',
    link: 'https://www.abs.gov.au/statistics/health/health-conditions-and-risks/sun-protection-behaviours/latest-release'
  },
  {
    id: 4,
    category: 'Guideline',
    year: '2024',
    title: 'Balancing the risks and benefits of sun exposure: A revised position statement for Australian adults',
    source: 'Monash University',
    summary:
      'This source discusses safe sun exposure in a balanced way, including both risks such as skin cancer and wider health considerations.',
    whyItMatters:
      'The best advice is balanced and usable, not fear-heavy and unrealistic.',
    link: 'https://research.monash.edu/en/publications/balancing-the-risks-and-benefits-of-sun-exposure-a-revised-positi/'
  },
  {
    id: 5,
    category: 'Article',
    year: '2024',
    title: 'Concerning new data shows almost half of Australians aren’t using adequate sun protection',
    source: 'Cancer Council',
    summary:
      'A Cancer Council media release reporting new Australian survey findings on sunscreen use, tanning behaviour and inadequate sun protection during peak UV times.',
    whyItMatters:
      'Plenty of people still under-protect, so a quick UV check before going out can make a real difference.',
  link: 'https://www.cancer.org.au/media-releases/2024/concerning-new-data-shows-almost-half-of-australians-aren-t-using-adequate-sun-protection'
  }
]

const filteredResources = computed(() => {
  let result = resources

  if (selectedFilter.value !== 'All') {
    result = result.filter(
      (resource) => resource.category === selectedFilter.value
    )
  }

  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter((resource) => {
      return (
        resource.title.toLowerCase().includes(keyword) ||
        resource.source.toLowerCase().includes(keyword) ||
        resource.summary.toLowerCase().includes(keyword) ||
        resource.category.toLowerCase().includes(keyword)
      )
    })
  }

  return result
})
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  padding: 40px 20px 60px;
  background:
    radial-gradient(circle at top left, rgba(255, 196, 0, 0.18), transparent 28%),
    linear-gradient(180deg, #fffdf8 0%, #f6fbff 100%);
}

.resources-hero {
  max-width: 900px;
  margin: 0 auto 30px;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  margin-bottom: 12px;
  padding: 7px 14px;
  border-radius: 999px;
  background-color: #fff0c9;
  color: #8c5a00;
  font-size: 0.85rem;
  font-weight: 700;
}

.resources-hero h1 {
  margin: 0 0 14px;
  font-size: 2.3rem;
  line-height: 1.2;
  color: #183153;
}

.hero-description {
  max-width: 760px;
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.7;
  color: #526274;
}

.toolbar {
  max-width: 1100px;
  margin: 0 auto 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d7e2ec;
  border-radius: 14px;
  font-size: 0.98rem;
  outline: none;
  background: #ffffff;
  box-sizing: border-box;
}

.search-box input:focus {
  border-color: #3d84d8;
  box-shadow: 0 0 0 3px rgba(61, 132, 216, 0.12);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  border: 1px solid #d6e1ea;
  background: #ffffff;
  color: #31465b;
  padding: 10px 15px;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.filter-btn:hover {
  transform: translateY(-1px);
  border-color: #7fb0e8;
}

.filter-btn.active {
  background: #183153;
  color: #ffffff;
  border-color: #183153;
}

.results-summary {
  max-width: 1100px;
  margin: 0 auto 18px;
  color: #5e6d7d;
  font-weight: 600;
}

.resources-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 22px;
}

.resource-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 22px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 244, 220, 0.98) 0%, rgba(255, 253, 247, 0.98) 100%);
  border: 1px solid #f1d6a9;
  box-shadow: 0 16px 34px rgba(164, 96, 30, 0.12);
  overflow: hidden;
}

.resource-card::before {
  content: '';
  position: absolute;
  top: 14px;
  right: 14px;
  width: 78px;
  height: 78px;
  border-radius: 18px;
  border: 2px dashed #e7b36d;
}

.resource-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(188, 137, 76, 0.07) 1px, transparent 1px);
  background-size: 100% 2rem;
  pointer-events: none;
}

.postcard-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 86px;
  height: 86px;
  background: linear-gradient(135deg, transparent 50%, rgba(243, 214, 169, 0.92) 50%);
}

.card-header,
.resource-title,
.resource-source,
.resource-summary,
.why-box,
.learn-more-btn {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
}

.category {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #9a460f;
  font-size: 0.82rem;
  font-weight: 700;
}

.year {
  color: #8d623f;
  font-size: 0.9rem;
  font-weight: 700;
}

.resource-title {
  margin: 0 0 10px;
  font-size: 1.15rem;
  line-height: 1.45;
  color: #412517;
}

.resource-source {
  margin: 0 0 14px;
  color: #8a572f;
  font-weight: 700;
  font-size: 0.95rem;
}

.resource-summary {
  margin: 0 0 18px;
  color: #624d3f;
  line-height: 1.65;
  font-size: 0.96rem;
}

.why-box {
  margin-top: auto;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid #efd8b7;
  border-radius: 16px;
  padding: 14px;
  backdrop-filter: blur(4px);
}

.why-box h3 {
  margin: 0 0 8px;
  font-size: 0.95rem;
  color: #7b3914;
}

.why-box p {
  margin: 0;
  color: #624d3f;
  line-height: 1.6;
  font-size: 0.94rem;
}

.learn-more-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-top: 18px;
  padding: 12px 16px;
  border-radius: 999px;
  background: #8e3b12;
  color: #fff8f0;
  text-decoration: none;
  font-weight: 700;
  transition: 0.2s ease;
  box-shadow: 0 10px 20px rgba(142, 59, 18, 0.18);
}

.learn-more-btn:hover {
  transform: translateY(-2px);
  background: #a94819;
}

.empty-state {
  max-width: 700px;
  margin: 40px auto 0;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e3ebf2;
  border-radius: 20px;
  padding: 30px 20px;
  box-shadow: 0 10px 24px rgba(18, 42, 66, 0.06);
}

.empty-state h3 {
  margin: 0 0 10px;
  color: #183153;
}

.empty-state p {
  margin: 0;
  color: #617182;
}

@media (max-width: 768px) {
  .resources-page {
    padding: 28px 16px 48px;
  }

  .resources-hero h1 {
    font-size: 1.8rem;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .toolbar {
    gap: 14px;
  }

  .resource-card::before,
  .postcard-corner {
    display: none;
  }
}

@media (min-width: 900px) {
  .toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) auto;
    align-items: center;
  }
}
</style>
