<?php
/**
 * Newspack Data Events Popups helper.
 *
 * @package Newspack
 */

namespace Newspack\Data_Events;

use Newspack_Popups_Model;
use Newspack\Data_Events;
use WP_Error;

/**
 * Class to register the Popups listeners.
 */
final class Popups {

	/**
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION = 'form_submission';

	/**
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION_SUCCESS = 'form_submission_success';

	/**
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION_FAILURE = 'form_submission_failure';

	/**
	 * Initialize the class by registering the listeners.
	 *
	 * @return void
	 */
	public static function init() {
		Data_Events::register_listener(
			'newspack_reader_registration_form_processed',
			'campaign_interaction',
			[ __CLASS__, 'registration_submission' ]
		);

		Data_Events::register_listener(
			'newspack_reader_registration_form_processed',
			'campaign_interaction',
			[ __CLASS__, 'registration_submission_with_status' ]
		);

		Data_Events::register_listener(
			'newspack_newsletters_subscribe_form_processed',
			'campaign_interaction',
			[ __CLASS__, 'newsletter_submission' ]
		);

		Data_Events::register_listener(
			'newspack_newsletters_subscribe_form_processed',
			'campaign_interaction',
			[ __CLASS__, 'newsletter_submission_with_status' ]
		);

		Data_Events::register_listener(
			'newspack_data_event_dispatch_donation_new',
			'campaign_interaction',
			[ __CLASS__, 'donation_submission_success' ]
		);

		Data_Events::register_listener(
			'newspack_stripe_handle_donation_before',
			'campaign_interaction',
			[ __CLASS__, 'donation_submission_stripe' ]
		);

		Data_Events::register_listener(
			'newspack_stripe_handle_donation_error',
			'campaign_interaction',
			[ __CLASS__, 'donation_submission_stripe_error' ]
		);

		Data_Events::register_listener(
			'newspack_data_event_dispatch_woocommerce_donation_order_processed',
			'campaign_interaction',
			[ __CLASS__, 'donation_submission_woocommerce' ]
		);

		Data_Events::register_listener(
			'newspack_data_event_dispatch_woocommerce_order_failed',
			'campaign_interaction',
			[ __CLASS__, 'donation_submission_woocommerce_error' ]
		);

	}

	/**
	 * Extract the relevant data from a popup.
	 *
	 * @param int|array $popup The popup ID or object.
	 * @return array
	 */
	public static function get_popup_metadata( $popup ) {
		if ( is_numeric( $popup ) ) {
			$popup = Newspack_Popups_Model::retrieve_popup_by_id( $popup );
		}
		$data = [];
		if ( ! $popup ) {
			return $data;
		}

		$data['campaign_id']    = $popup['id'];
		$data['campaign_title'] = $popup['title'];

		if ( isset( $popup['options'] ) ) {
			$data['campaign_frequency'] = $popup['options']['frequency'] ?? '';
			$data['campaign_placement'] = $popup['options']['placement'] ?? '';
		}

		$data['campaign_has_registration_block'] = has_block( 'newspack/reader-registration', $popup['content'] );
		$data['campaign_has_donation_block']     = has_block( 'newspack-blocks/donate', $popup['content'] );
		$data['campaign_has_newsletter_block']   = has_block( 'newspack-newsletters/subscribe', $popup['content'] );

		return $data;
	}

	/**
	 * A listener for the registration block form submission
	 *
	 * Will trigger the event with "form_submission" as action in all cases.
	 *
	 * @param string              $email   Email address of the reader.
	 * @param int|false|\WP_Error $user_id The created user ID in case of registration, false if not created or a WP_Error object.
	 * @param int|false           $popup_id The ID of the popup that triggered the registration, or false if not triggered by a popup.
	 * @return ?array
	 */
	public static function registration_submission( $email, $user_id, $popup_id ) {
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action' => self::FORM_SUBMISSION,
			]
		);
	}

	/**
	 * A listener for the registration block form submission
	 *
	 * Will trigger the event with "form_submission_success" or "form_submission_failure" as action.
	 *
	 * @param string              $email   Email address of the reader.
	 * @param int|false|\WP_Error $user_id The created user ID in case of registration, false if not created or a WP_Error object.
	 * @param int|false           $popup_id The ID of the popup that triggered the registration, or false if not triggered by a popup.
	 * @return ?array
	 */
	public static function registration_submission_with_status( $email, $user_id, $popup_id ) {
		if ( ! $popup_id ) {
			return;
		}
		$action = self::FORM_SUBMISSION_SUCCESS;
		if ( ! $user_id || \is_wp_error( $user_id ) ) {
			$action = self::FORM_SUBMISSION_FAILURE;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action' => $action,
			]
		);
	}

	/**
	 * A listener for the registration block form submission
	 *
	 * Will trigger the event with "form_submission" as action in all cases.
	 *
	 * @param string         $email  Email address of the reader.
	 * @param array|WP_Error $result Contact data if it was added, or error otherwise.
	 * @param int|false      $popup_id The ID of the popup that triggered the registration, or false if not triggered by a popup.
	 * @return ?array
	 */
	public static function newsletter_submission( $email, $result, $popup_id = false ) {
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action' => self::FORM_SUBMISSION,
			]
		);
	}

	/**
	 * A listener for the registration block form submission
	 *
	 * Will trigger the event with "form_submission_success" or "form_submission_failure" as action.
	 *
	 * @param string         $email  Email address of the reader.
	 * @param array|WP_Error $result Contact data if it was added, or error otherwise.
	 * @param int|false      $popup_id The ID of the popup that triggered the registration, or false if not triggered by a popup.
	 * @return ?array
	 */
	public static function newsletter_submission_with_status( $email, $result, $popup_id = false ) {
		if ( ! $popup_id ) {
			return;
		}
		$action = self::FORM_SUBMISSION_SUCCESS;
		if ( ! $result || \is_wp_error( $result ) ) {
			$action = self::FORM_SUBMISSION_FAILURE;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action' => $action,
			]
		);
	}

	/**
	 * A listener for the new_donation event
	 *
	 * @param int   $timestamp EventTimestamp.
	 * @param array $data      The new_donation event data.
	 * @return ?array
	 */
	public static function donation_submission_success( $timestamp, $data ) {
		$popup_id = $data['popup_id'] ?? false;
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action'              => self::FORM_SUBMISSION_SUCCESS,
				'donation_amount'     => $data['amount'],
				'donation_currency'   => $data['currency'],
				'donation_recurrence' => $data['recurrence'],
				'donation_platform'   => $data['platform'],
				'referer'             => $data['referer'],
			]
		);
	}

	/**
	 * A listener for when the stripe starts to handle a donation
	 *
	 * @param array $config Data about the donation.
	 * @param array $stripe_data Data about the Stripe connection.
	 * @return ?array
	 */
	public static function donation_submission_stripe( $config, $stripe_data ) {
		$popup_id = $config['payment_metadata']['newspack_popup_id'] ?? false;
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action'              => self::FORM_SUBMISSION,
				'donation_amount'     => $config['amount'],
				'donation_currency'   => $stripe_data['currency'],
				'donation_recurrence' => $config['frequency'],
				'donation_platform'   => 'stripe',
				'referer'             => $config['payment_metadata']['referer'],
			]
		);
	}

	/**
	 * A listener for when stripe fails handle a donation
	 *
	 * @param array  $config Data about the donation.
	 * @param array  $stripe_data Data about the Stripe connection.
	 * @param string $error_message Error message.
	 * @return ?array
	 */
	public static function donation_submission_stripe_error( $config, $stripe_data, $error_message ) {
		$popup_id = $config['payment_metadata']['newspack_popup_id'] ?? false;
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action'              => self::FORM_SUBMISSION_FAILURE,
				'donation_amount'     => $config['amount'],
				'donation_currency'   => $stripe_data['currency'],
				'donation_recurrence' => $config['frequency'],
				'donation_platform'   => 'stripe',
				'donation_error'      => $error_message,
				'referer'             => $config['payment_metadata']['referer'],
			]
		);
	}

	/**
	 * A listener for when woocommerce processes a donation
	 *
	 * @param int   $timestamp EventTimestamp.
	 * @param array $data      The new_donation event data.
	 * @return ?array
	 */
	public static function donation_submission_woocommerce( $timestamp, $data ) {
		$popup_id = $data['popup_id'] ?? false;
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action'              => self::FORM_SUBMISSION,
				'donation_amount'     => $data['amount'],
				'donation_currency'   => $data['currency'],
				'donation_recurrence' => $data['recurrence'],
				'donation_platform'   => $data['platform'],
				'referer'             => $data['referer'],
			]
		);
	}

	/**
	 * A listener for when woocommerce fails to processes a donation
	 *
	 * @param int   $timestamp EventTimestamp.
	 * @param array $data      The new_donation event data.
	 * @return ?array
	 */
	public static function donation_submission_woocommerce_error( $timestamp, $data ) {
		$popup_id = $data['popup_id'] ?? false;
		if ( ! $popup_id ) {
			return;
		}
		$popup_data = self::get_popup_metadata( $popup_id );
		return array_merge(
			$popup_data,
			[
				'action'              => self::FORM_SUBMISSION_FAILURE,
				'donation_amount'     => $data['amount'],
				'donation_currency'   => $data['currency'],
				'donation_recurrence' => $data['recurrence'],
				'donation_platform'   => $data['platform'],
				'referer'             => $data['referer'],
			]
		);
	}

}
Popups::init();
