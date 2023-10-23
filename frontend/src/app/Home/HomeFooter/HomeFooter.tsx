import { Discord, Facebook, GitHub, Instagram } from 'iconoir-react';
import styles from './HomeFooter.module.scss';

const HomeFooter = () => {
	return (
		<div className={styles.root}>
			<div className={styles.container}>
				<div className={styles.footerColumn}>
					<h6>GET STARTED</h6>
					<ul>
						<li>
							<a href="/catalog">Catalog</a>
						</li>
						<li>
							<a href="/grades">Grades</a>
						</li>
						<li>
							<a href="/enrollment">Enrollment</a>
						</li>
						<li>
							<a href="/scheduler">Scheduler</a>
						</li>
					</ul>
				</div>
				<div className={styles.footerColumn}>
					<h6>SUPPORT</h6>
					<ul>
						<li>
							<a>Report a Bug</a>
						</li>
						<li>
							<a href="mailto:octo.berkeleytime@asuc.org">Contact Us</a>
						</li>
						<li>
							<a href="/releases">Releases</a>
						</li>
						<li>
							<a href="/faq">FAQ</a>
						</li>
					</ul>
				</div>
				<div className={styles.footerColumn}>
					<h6>ABOUT US</h6>
					<ul>
						<li>
							<a href="/about">Our Team</a>
						</li>
						<li>
							<a href="https://octo.asuc.org">ASUC OCTO</a>
						</li>
						<li>
							<a href="/legal/privacy">Privacy Policy</a>
						</li>
						<li>
							<a href="/legal/terms">Terms of Service</a>
						</li>
					</ul>
				</div>{' '}
				<div className={styles.footerColumn}>
					<h6>SOCIAL</h6>
					<ul>
						<li>
							<a href="https://www.instagram.com/" target="_blank">
								<Instagram />
							</a>
						</li>
						<li>
							<a href="https://discord.gg/uP2bTPh99U">
								<Discord />
							</a>
						</li>
						<li>
							<a href="https://facebook.com/berkeleytime">
								<Facebook />
							</a>
						</li>
						<li>
							<a href="https://github.com/asuc-octo/berkeleytime">
								<GitHub />
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default HomeFooter;
