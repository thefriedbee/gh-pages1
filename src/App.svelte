<script>
	import Header from "./components/Header.svelte";
	import IntroCard from "./components/IntroCard.svelte";
	import Footer from "./components/Footer.svelte";
	import Rightbar from "./components/Rightbar.svelte";
	import PaperCard from "./components/PaperCard.svelte";
    import AboutMe from "./components/AboutMe.svelte";

	// add variables/functions for page navigation
	let items = ["Bio", "Papers"];
	let activeItem = "Bio";
	const tabChange = (e) => {
		activeItem = e.detail;
	}

	// language settings
	let languages = ["en", "中"]
	let activeLang = "en";
	const langChange = (e) => {
		activeLang = e.detail;
	}

	// add variables for the cards...
	let research_interests = [
		'Scalable data computation tasks (data science)',
		'Machine Learning applications in transportation field (machine learning, deep learning)',
		'Computer Science algorithms, traffic simulation, optimization algorithms, etc.',
	];

	let research_interests_cn = [
		"大数据计算",
		"机器学习/深度学习/强化学习",
		"计算机算法, 交通仿真, 图算法,优化问题等"
	];

	let my_skills = [
		"Programming Language: Python, R, JavaScript, C++, SQL, git, etc.",
		"Python Packages: Numpy, Matplotlib, Pandas, PyTorch, Keras, Gurobipy, etc.",
		"Industrial Softwares: SUMO, Vissim, ArcGIS, QGIS, Matlab, Simio, etc."
	];

	let my_skills_cn = [
		"编程语言: Python, R, JavaScript, C++, SQL, git, etc.",
		"编程包: Numpy, Matplotlib, Pandas, PyTorch, Keras, Gurobipy, TraCI, etc.",
		"工业软件: SUMO, Vissim, ArcGIS, QGIS, Matlab, Simio, etc."
	];

	let my_methods = [
		"Modeling: Statistical Machine Learning & Deep Learning.",
		"Optimization: Reinforcement Learning, Linear/Convex Optimization, etc.",
		"Visualization: scientific & interactive diagrams"
	];

	let my_methods_cn = [
		"建模: 统计学习/机器学习",
		"优化: 强化学习/线性优化",
		"可视化: 科学绘图",
	];
</script>

<Header {activeItem} {items} on:tabChange={tabChange}
 {activeLang} {languages} on:langChange={langChange}/>

<main>
	<div class="row">
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div class="scrollspy-example col-md-9" tabindex="0">

			<AboutMe {activeLang} />

			<hr>

			{#if activeLang == "en"}
				<IntroCard
					title="Research Interests"
					bullets={research_interests}
				/>
			{:else if activeLang == "中"}
				<IntroCard
					title="研究内容:"
					bullets={research_interests_cn}
				/>
			{/if}

			{#if activeLang == "en"}
				<IntroCard
					title="Skillsets"
					bullets={my_skills}
				/>
			{:else if activeLang == "中"}
				<IntroCard
					title="常用技术栈"
					bullets={my_skills_cn}
				/>
			{/if}
			
			{#if activeLang == "en"}
				<IntroCard
					title="Methdologies"
					bullets={my_methods}
				/>
			{:else if activeLang == "中"}
				<IntroCard
					title="研究方法"
					bullets={my_methods_cn}
				/>
			{/if}

			<hr id="Papers">
			<h4>Important Papers & Reports</h4>
			<PaperCard
				imageSrc="/img/lp_method_comparison.jpeg"
				title="Innovative Method for Estimating Large Truck Volume Using Aggregate Volume and Occupancy Data Incorporating Empirical Knowledge Into Linear Programming"
				webLink=""
				paperLink="https://journals.sagepub.com/doi/abs/10.1177/03611981221094569"
				summary="Single loop detectors (or its equivalents) are the most equipped traffic detecotr. 
				By default, it generates count and occupancy every 20 or 30 seconds.
				 Most methods assume an average vehicle length to estimate traffic speed, making the estimation far from truth.
				 In our study, assuming fleet is composed of short and long vehicle, we use linear programming method to speculate the 'right' combination of Long/Short vehicles.
				 Our proposed method outcompete most other methods by a large margin in most situations. 
				 Results are quite similar to the Weigh-in-Motion station results (see left figure comparing results lane by lane)."
			/>

			<PaperCard
				imageSrc="/img/travel_speed_plot.png"
				title="Analyzing Robustness of the Deep Reinforcement Learning Algorithm in Ramp Metering Applications Considering False Data Injection Attack and Defense"
				webLink=""
				paperLink="https://arxiv.org/abs/2301.12036"
				summary="Ramp metering is the art of smoothly control on-ramp vehicles to the highway mainline.
				 We analyzed the robustness of the learning algorithm using both the traditional ALINEA method and the reinforcement learning method.
				 Furthermore, we try to use False Data Injection to attack and undermine the model.
				 Results show that the model we proposed is quite robust."
			/>

			<PaperCard
				imageSrc="/img/pnr_modes.png"
				title="Evaluating Sustainability Impacts of Intelligent Carpooling/Vanpooling System among SOV Commuters, Phase II: Park and Ride Interactions"
				webLink="https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpoolingvanpooling-system-among-sov"
				paperLink=""
				summary="A simulation program and matching algorithm to find the upperbound of carpool potentials among SOV drivers. 
				Two modes are investigated: (1) driver picks up passenger at passegner's home (Direct Carpool mode); 
				(2) both carpooler's meet at a parking lot before carpool together (PNR mode)."
			/>

			<PaperCard
				imageSrc="/img/pnr_carpool.png"
				title="Evaluating the Sustainability Impacts of Intelligent Carpooling Systems for SOV Commuters in the Atlanta Region"
				webLink="https://escholarship.org/uc/item/9c749361"
				paperLink="https://escholarship.org/uc/item/9c749361"
				summary="A simulation program and matching algorithm to find the upperbound of carpool potentials among SOV drivers."
			/>
			
			<h4>Research programs Involved</h4>
			<ul class="list-unstyled">
				<li><a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2038922&HistoricalAwards=false">CPS program</a></li>
				<li><a href="https://utorii.com/gate/">GATE scholarship</a></li>
				<li><a href="https://smartway.tn.gov/">TDOT Smartway</a></li>
				<li><a href="https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpoolingvanpooling-system-among-sov">NCST CarpoolSim phase 1</a></li>
				<li><a href="https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpooling-system-among-single-occupancy">NCST CarpoolSim phase 2</a></li>
			</ul>
		</div>

		<div class="col-md-3">
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
		margin: 50px auto;
		text-align: left;
		background-color: rgba(255, 255, 255, 1.0);
	}

	/* style for large screen*/
	@media (min-width: 1080px) {
		main {
			max-width: 1080px;
		}
	}

	/* style for mobile devise*/
	@media (max-width: 768px) {
		main {
			text-align: center;
			padding: 1em;
			max-width: 768px;
			margin: 1px auto;
			text-align: left;
			background-color: rgba(255, 255, 255, 1.0);
		}
	}

	.list-unstyled {
		margin: 10px auto;
	}

	h2, h4 {
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

	ul {
		max-width: 960px;
		margin: 20px auto;
		text-align: left;
	}
</style>