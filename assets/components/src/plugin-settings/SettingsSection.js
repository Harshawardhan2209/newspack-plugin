/**
 * Ads Settings Section.
 */

/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ActionCard, Grid, Button, TextControl, CheckboxControl, SelectControl } from '../';
import './style.scss';

const getControlComponent = setting => {
	if ( Array.isArray( setting.options ) && setting.options.length ) {
		return SelectControl;
	}
	switch ( setting.type ) {
		case 'checkbox':
		case 'boolean':
			return CheckboxControl;
		default:
			return TextControl;
	}
};
const getControlType = setting => {
	switch ( setting.type ) {
		case 'int':
		case 'integer':
		case 'float':
		case 'number':
			return 'number';
		case 'string':
		case 'text':
			return 'text';
		case 'boolean':
		case 'checkbox':
			return 'checkbox';
		default:
			return null;
	}
};

const SettingsSection = ( {
	active,
	title,
	description,
	fields,
	disabled,
	onChange,
	onUpdate,
} ) => {
	const isSingleLined = index => {
		const total = fields.length;
		const hasSingleLinedField = fields.length % 3 !== 0 && fields.length % 2 !== 0;
		const isLast = index === total - 1;
		return hasSingleLinedField && isLast;
	};
	const getControlProps = ( setting, index ) => ( {
		disabled,
		name: `${ setting.section }_${ setting.key }`,
		type: getControlType( setting ),
		label: setting.description,
		help: setting.help || null,
		options:
			setting.options?.map( option => ( {
				value: option.value,
				label: option.name,
			} ) ) || null,
		value: setting.value,
		checked: setting.type === 'boolean' ? !! setting.value : null,
		className: classnames( {
			'padded-checkbox': setting.type === 'boolean' && ! isSingleLined( index ),
		} ),
		onChange: value => {
			onChange( setting.key, value );
		},
	} );
	return (
		<ActionCard
			isMedium
			disabled={ disabled }
			title={ title }
			description={ description }
			toggleChecked={ active }
			hasGreyHeader={ true }
			toggleOnChange={ active !== null ? value => onUpdate( { active: value } ) : null }
		>
			{ ( active || active === null ) && (
				<Fragment>
					<Grid columns={ fields.length % 3 === 0 ? 3 : 2 } gutter={ 32 }>
						{ fields.map( ( setting, index ) => {
							const Control = getControlComponent( setting ); // eslint-disable-line @wordpress/no-unused-vars-before-return, no-unused-vars
							return <Control key={ setting.key } { ...getControlProps( setting, index ) } />;
						} ) }
					</Grid>
					<div className="newspack-buttons-card" style={ { margin: '32px 0 0' } }>
						<Button
							isPrimary
							disabled={ disabled }
							onClick={ () => {
								onUpdate();
							} }
						>
							{ __( 'Save settings', 'newspack' ) }
						</Button>
					</div>
				</Fragment>
			) }
		</ActionCard>
	);
};

export default SettingsSection;