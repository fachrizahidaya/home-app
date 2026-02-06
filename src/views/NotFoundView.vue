<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <router-link to="/dashboard" class="home-link">Go to Dashboard</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.not-found-content {
  text-align: center;
  padding: 3rem;
}

h1 {
  font-size: 8rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  opacity: 0.9;
}

h2 {
  font-size: 1.5rem;
  margin: 1rem 0;
}

p {
  opacity: 0.8;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: white;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.home-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
</style>
