/**
 * Subscriptions Wizard.
 */

/**
 * WordPress dependencies
 */
import { Component, Fragment, render } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ImageUpload from '../../components/imageUpload';
import CheckboxControl from '../../components/checkboxControl';
import Card from '../../components/card';
import Button from '../../components/button';
import FormattedHeader from '../../components/formattedHeader';
import TextControl from '../../components/textControl';
import ProgressBar from '../../components/progressBar';
import Checklist from '../../components/checklist';
import Task from '../../components/task';
import './style.scss';

/**
 * Subscriptions wizard stub for example purposes.
 */
class SubscriptionsWizard extends Component {

	/**
	 * constructor. Demo of how the parent interacts with the components, and controls their values.
	 */
	constructor() {
		super( ...arguments );
		this.state = {
			currentTask: 0,
			inputTextValue1: "Input value",
			inputTextValue2: "",
			image: null,
		}
	}

	/**
	 * Render the example stub.
	 */
	render() {
		const { inputTextValue1, inputTextValue2, currentTask } = this.state;

		return(
			<Fragment>
				<FormattedHeader
					headerText={ __( 'Newspack Components' ) }
					subHeaderText={ __( 'Temporary demo of Newspack components' ) }
				/>
				<Checklist currentTask={ currentTask } progressBarText={ __( 'Your setup list' ) }>
					<Task
						title={ __( 'Set up membership' ) }
						description={ __( 'Optimize your site for search engines and social media by taking advantage of our SEO tools. We\'ll walk you through important SEO strategies to get more exposure for your business.' ) }
						buttonText={ __( 'Do it' ) }
						completedTitle={ __( 'All set!' ) }
						onClick={ () => this.setState( { currentTask: 1 } ) }
						onSkip={ () => this.setState( { currentTask: 1 } ) }
					/>
					<Task
						title={ __( 'Set up your paywall' ) }
						description={ __( 'Optimize your site for search engines and social media by taking advantage of our SEO tools. We\'ll walk you through important SEO strategies to get more exposure for your business.' ) }
						buttonText={ __( 'Do it' ) }
						completedTitle={ __( 'All set!' ) }
						onClick={ () => this.setState( { currentTask: 2 } ) }
						onSkip={ () => this.setState( { currentTask: 2 } ) }
					/>
					<Task
						title={ __( 'Customize your donations page' ) }
						description={ __( 'Optimize your site for search engines and social media by taking advantage of our SEO tools. We\'ll walk you through important SEO strategies to get more exposure for your business.' ) }
						buttonText={ __( 'Do it' ) }
						completedTitle={ __( 'All set!' ) }
						onClick={ () => this.setState( { currentTask: 3 } ) }
						onSkip={ () => this.setState( { currentTask: 3 } ) }
					/>
					<Task
						title={ __( 'Setup Call to Action block' ) }
						description={ __( 'Optimize your site for search engines and social media by taking advantage of our SEO tools. We\'ll walk you through important SEO strategies to get more exposure for your business.' ) }
						buttonText={ __( 'Do it' ) }
						completedTitle={ __( 'All set!' ) }
						onClick={ () => this.setState( { currentTask: 4 } ) }
						onSkip={ () => this.setState( { currentTask: 4 } ) }
					/>
				</Checklist>
				<Card>
					<FormattedHeader
						headerText={ __( 'Checkboxes' ) }
					/>
					<CheckboxControl
				        label={ __( 'Checkbox is tested?' ) }
				        onChange={ function(){ console.log( 'Yep, it\'s tested' ); } }
					/>
					<CheckboxControl
				        label={ __( 'Checkbox w/Tooltip' ) }
				        onChange={ function(){ console.log( 'Yep, it\'s tested' ); } }
				        tooltip="This is tooltip text"
					/>
				</Card>
				<Card>
					<FormattedHeader
						headerText={ __( 'Image Uploader' ) }
					/>
					<ImageUpload
						image={ this.state.image }
						onChange={ image => {
							this.setState( { image } );
							console.log( 'Image:' );
							console.log( image );
						} }
					/>
				</Card>
				<Card>
					<FormattedHeader
						headerText={ __( 'Text Inputs' ) }
					/>
					<TextControl
						label={ __( 'Text Input with value' ) }
						value={ inputTextValue1 }
						onChange={ value => this.setState( { inputTextValue1: value } ) }
					/>
					<TextControl
						label={ __( 'Text Input empty' ) }
						value={ inputTextValue2 }
						onChange={ value => this.setState( { inputTextValue2: value } ) }
					/>
					<TextControl
						label={ __( 'Text Input disabled' ) }
						disabled
					/>
					<Button isPrimary className="is-centered">Continue</Button>
					<Button isDefault className="is-centered">Continue</Button>
					<Button isTertiary className="is-centered">Continue</Button>
				</Card>
				<Card>
					<FormattedHeader
						headerText={ __( 'Progress bar' ) }
					/>
					<ProgressBar completed="2" total="3" />
					<ProgressBar completed="2" total="5" label={ __( 'Progress made' ) } />
					<ProgressBar completed="0" total="5" displayFraction />
					<ProgressBar completed="3" total="8" label={ __( 'Progress made' ) } displayFraction />
				</Card>

				<Button isPrimary>Continue</Button>
				<Button isDefault>Continue</Button>
				<Button isTertiary>Continue</Button>
			</Fragment>
		);
	}
}

render(
  <SubscriptionsWizard />,
  document.getElementById( 'newspack-subscriptions-wizard' )
);
