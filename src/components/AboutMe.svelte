<script>
  // a paragraph explaining the content of the paper (could be the abstract)
  export let activeLang;
</script>


<div class="about-me">
  <div class="image">
    <img src="/img/my-img.jpeg" class="img-fluid" alt="My Selfie">
  </div>
  <div class="info-lang">
    {#if activeLang == "en"}
    <h2 id="Bio">Diyi Liu</h2>
    <ul class="list-unstyled">
      <li>Ph.D student in Transportation Engineering at University of Tennessee, Knoxville</li>
      <li>Advisor: <a href="https://cee.utk.edu/people/lee-d-han/">Dr. Lee D Han</a></li>
    </ul>
    {:else if activeLang == "中"}
    <h2 id="Bio">刘迪一</h2>
    <ul class="list-unstyled">
      <li>田纳西大学, 诺克斯维尔分校(UT, Knoxville)交通工程专业在读博士</li>
      <li>导师: <a href="https://cee.utk.edu/people/lee-d-han/" target="_blank">Dr. Lee D Han(韩立教授)</a></li>
    </ul>
    {/if}
  </div>
</div>

<style>
  /* Add your CSS styles for the PaperCard component here */
  .about-me {
    display: flex;
    flex-direction: row;
    margin: 20px;
    margin-left: 80px;
    padding: 10px;
    border-radius: 5px;
  }

  h4 {
    font-size: 1.0rem;
    margin-top: 0;
  }

  /* Media query for narrow screens (e.g., mobile) */
  @media (max-width: 768px) {
    .about-me {
      flex-direction: column;
      margin-left: 20px;
    }
  }

  .info-lang {
    flex: 3;
	  flex-direction: row;
    margin-left: 20px;
  }

  .image {
    flex: -1; /* Move image to the top */
    max-width: 150px;
    min-width: 100px;
    margin: 10px;
  }
</style>
  