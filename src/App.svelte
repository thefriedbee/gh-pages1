<script>
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	import Rightbar from "./components/Rightbar.svelte";

	let name = "Diyi Liu's website";
	let items = ["Bio", "Research", "Skillsets", "Applications", "Tutorial"];
	let activeItem = "Bio";
	const tabChange = (e) => {
		activeItem = e.detail;
	}
</script>

<Header {activeItem} {items} on:tabChange={tabChange}/>

<main>
	<div class="row">
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div data-bs-spy="scroll" data-bs-target="#navbar-example2"
		data-bs-offset="0" class="scrollspy-example col-md-8" tabindex="0">
			<hr>
			<div class="row">
				<div class="col-md-8">
					<h2 id="Bio">Diyi Liu</h2>
					<ul class="list-unstyled">
						<li>Ph.D student in Transportation Engineering at University of Tennessee, Knoxville</li>
						<li>Advisor: <a href="https://cee.utk.edu/people/lee-d-han/">Dr. Lee D Han</a></li>
					</ul>
				</div>
				<div class="col-md-4">
					<img src="/img/my-img.jpeg" class="img-fluid" alt="My Photo">
				</div>
			</div>
			
			<hr>
			<h2 id="Research">Research Interests</h2>
			<ul class="list-unstyled">
				<li>Scalable data computation tasks</li>
				<li>Machine Learning applications</li>
				<li>Computer Science algorithms, traffic simulation, optimization algorithms, etc.</li>
			</ul>
			
			<hr>
			<h2>Programs Involved</h2>
			<ul class="list-unstyled">
				<li><a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2038922&HistoricalAwards=false">CPS program</a></li>
				<li><a href="https://utorii.com/gate/">GATE scholarship</a></li>
				<li><a href="https://smartway.tn.gov/">TDOT Smartway</a></li>
				<li><a href="https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpoolingvanpooling-system-among-sov">NCST 1</a></li>
				<li><a href="https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpooling-system-among-single-occupancy">NCST 2</a></li>

			</ul>

			<hr>
			<h2>Important Papers & Reports</h2>
			<ul class="list-unstyled">
				<li><a href="https://journals.sagepub.com/doi/abs/10.1177/03611981221094569">
					Innovative Method for Estimating Large Truck Volume Using Aggregate Volume and Occupancy Data Incorporating Empirical Knowledge Into Linear Programming</a></li>
				<br>
				<li><a href="https://escholarship.org/uc/item/9c749361">
					Evaluating the Sustainability Impacts of Intelligent Carpooling Systems for SOV Commuters in the Atlanta Region</a></li>
				<br>
				<li><a href="https://arxiv.org/abs/2301.12036">Analyzing Robustness of the Deep Reinforcement Learning Algorithm in Ramp Metering Applications Considering False Data Injection Attack and Defense</li>
				<br>
				<li><a href="https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpoolingvanpooling-system-among-sov">Evaluating Sustainability Impacts of Intelligent Carpooling/Vanpooling System among SOV Commuters, Phase II: Park and Ride Interactions</li>
				<br>
			</ul>
			<hr>

			<h2 id="Skillsets">My Skillsets</h2>
			<ul class="list-unstyled">
				<li>Programming Language: Python, R, JavaScript, C++, SQL, git, etc.</li>
				<li>Python Packages: Numpy, Matplotlib, Pandas, PyTorch, Keras, Gurobipy, etc.</li>
				<li>Industrial Softwares: SUMO, Vissim, ArcGIS, QGIS, Matlab, Simio, etc.</li>
			</ul>
			<hr>

			<h2 id="Applications">Preferred Methodologies</h2>
			<ul class="list-unstyled">
				<li>Modeling: Statistical Machine Learning & Deep Learning.</li>
				<li>Optimization: Reinforcement Learning, Linear/Convex Optimization, etc.</li>
				<li>Visualization: scientific & interactive diagrams</li>
			</ul>
			<hr>

			<h2 id="Tutorial">Long-term Knowledge Sharing</h2>
			<!-- links to some of my tutorials on Bilibili or other websites -->
			<ul class="list-unstyled">
				<li>Numpy tutorial</li>
				<li>Matplolib tutorial</li>
				<li>More tutorials</li>
			</ul>
			<hr>
		</div>

		<div class="col-md-4">
			<Rightbar />
		</div>
	</div>
</main>

<Footer />

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 75px auto;
		text-align: left;
		background-color: rgba(255, 255, 255, 1.0);
	}

	/* h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	} */

	@media (min-width: 640px) {
		main {
			max-width: 1080px;
		}
	}

	h2 {
		color: #555;
		max-width: 960px;
		margin: 20px auto;
		text-align: left;
	}

	p {
		max-width: 960px;
		margin: 20px auto;
		text-align: left;
	}
</style>