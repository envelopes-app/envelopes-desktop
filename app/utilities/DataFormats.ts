/// <reference path='../_includes.ts' />

import { SimpleObjectMap } from '../utilities';
import { IDataFormat, IISOCurrency, INumberFormat } from '../interfaces/formatters';

export class DataFormats {

	public static currencies:IISOCurrency[] = [
		{
			"isCommon": false,
			"default_locale": "sq_AL",
			"iso_code": "ALL",
			"english_name": "Albanian Lek"
		},
		{
			"isCommon": false,
			"default_locale": "ar_DZ",
			"iso_code": "DZD",
			"english_name": "Algerian Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "es_AR",
			"iso_code": "ARS",
			"english_name": "Argentine Peso"
		},
		{
			"isCommon": false,
			"default_locale": "hy_AM",
			"iso_code": "AMD",
			"english_name": "Armenian Dram"
		},
		{
			"isCommon": true,
			"default_locale": "en_AU",
			"iso_code": "AUD",
			"english_name": "Australian Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "az_Cyrl_AZ",
			"iso_code": "AZM",
			"english_name": "Azerbaijanian Manat"
		},
		{
			"isCommon": false,
			"default_locale": "ar_BH",
			"iso_code": "BHD",
			"english_name": "Bahraini Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "bn_BD",
			"iso_code": "BDT",
			"english_name": "Bangladeshi Taka"
		},
		{
			"isCommon": false,
			"default_locale": "be_BY",
			"iso_code": "BYR",
			"english_name": "Belarusian Ruble"
		},
		{
			"isCommon": false,
			"default_locale": "en_BZ",
			"iso_code": "BZD",
			"english_name": "Belize Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "quz_BO",
			"iso_code": "BOB",
			"english_name": "Boliviano"
		},
		{
			"isCommon": false,
			"default_locale": "ms_BN",
			"iso_code": "BND",
			"english_name": "Brunei Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "bg_BG",
			"iso_code": "BGL",
			"english_name": "Bulgarian Lev"
		},
		{
			"isCommon": true,
			"default_locale": "en_CA",
			"iso_code": "CAD",
			"english_name": "Canadian Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "fr_PF",
			"iso_code": "XPF",
			"english_name": "CFP franc"
		},
		{
			"isCommon": false,
			"default_locale": "arn_CL",
			"iso_code": "CLP",
			"english_name": "Chilean Peso"
		},
		{
			"isCommon": false,
			"default_locale": "es_CO",
			"iso_code": "COP",
			"english_name": "Colombian Peso"
		},
		{
			"isCommon": false,
			"default_locale": "bs_Latn_BA",
			"iso_code": "BAM",
			"english_name": "Convertible Marks"
		},
		{
			"isCommon": false,
			"default_locale": "es_CR",
			"iso_code": "CRC",
			"english_name": "Costa Rican Colon"
		},
		{
			"isCommon": false,
			"default_locale": "hr_HR",
			"iso_code": "HRK",
			"english_name": "Croatian Kuna"
		},
		{
			"isCommon": false,
			"default_locale": "cs_CZ",
			"iso_code": "CZK",
			"english_name": "Czech Koruna"
		},
		{
			"isCommon": false,
			"default_locale": "da_DK",
			"iso_code": "DKK",
			"english_name": "Danish Krone"
		},
		{
			"isCommon": false,
			"default_locale": "es_DO",
			"iso_code": "DOP",
			"english_name": "Dominican Peso"
		},
		{
			"isCommon": false,
			"default_locale": "ar_EG",
			"iso_code": "EGP",
			"english_name": "Egyptian Pound"
		},
		{
			"isCommon": false,
			"default_locale": "et_EE",
			"iso_code": "EEK",
			"english_name": "Estonian Kroon"
		},
		{
			"isCommon": true,
			"default_locale": "en_IE",
			"iso_code": "EUR",
			"english_name": "Euro"
		},
		{
			"isCommon": false,
			"default_locale": "en_GH",
			"iso_code": "GHS",
			"english_name": "Ghanaian Cedi"
		},
		{
			"isCommon": false,
			"default_locale": "es_GT",
			"iso_code": "GTQ",
			"english_name": "Guatemalan Quetzal"
		},
		{
			"isCommon": false,
			"default_locale": "fr_HT",
			"iso_code": "HTG",
			"english_name": "Haitian Gourde"
		},
		{
			"isCommon": false,
			"default_locale": "es_HN",
			"iso_code": "HNL",
			"english_name": "Honduran Lempira"
		},
		{
			"isCommon": false,
			"default_locale": "zh_HK",
			"iso_code": "HKD",
			"english_name": "Hong Kong Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "hu_HU",
			"iso_code": "HUF",
			"english_name": "Hungarian Forint"
		},
		{
			"isCommon": false,
			"default_locale": "is_IS",
			"iso_code": "ISK",
			"english_name": "Icelandic Krona"
		},
		{
			"isCommon": false,
			"default_locale": "gu_IN",
			"iso_code": "INR",
			"english_name": "Indian Rupee"
		},
		{
			"isCommon": false,
			"default_locale": "id_ID",
			"iso_code": "IDR",
			"english_name": "Indonesian Rupiah"
		},
		{
			"isCommon": false,
			"default_locale": "fa_IR",
			"iso_code": "IRR",
			"english_name": "Iranian Rial"
		},
		{
			"isCommon": false,
			"default_locale": "ar_IQ",
			"iso_code": "IQD",
			"english_name": "Iraqi Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "he_IL",
			"iso_code": "ILS",
			"english_name": "Israeli New Shekel"
		},
		{
			"isCommon": false,
			"default_locale": "en_JM",
			"iso_code": "JMD",
			"english_name": "Jamaican Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "ja_JP",
			"iso_code": "JPY",
			"english_name": "Japanese Yen"
		},
		{
			"isCommon": false,
			"default_locale": "ar_JO",
			"iso_code": "JOD",
			"english_name": "Jordanian Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "kk_KZ",
			"iso_code": "KZT",
			"english_name": "Kazakhstani Tenge"
		},
		{
			"isCommon": false,
			"default_locale": "sw_KE",
			"iso_code": "KES",
			"english_name": "Kenyan Shilling"
		},
		{
			"isCommon": false,
			"default_locale": "ko_KR",
			"iso_code": "KRW",
			"english_name": "Korean Won"
		},
		{
			"isCommon": false,
			"default_locale": "ar_KW",
			"iso_code": "KWD",
			"english_name": "Kuwaiti Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "ka_GE",
			"iso_code": "GEL",
			"english_name": "Lari"
		},
		{
			"isCommon": false,
			"default_locale": "lv_LV",
			"iso_code": "LVL",
			"english_name": "Latvian Lats"
		},
		{
			"isCommon": false,
			"default_locale": "ar_LB",
			"iso_code": "LBP",
			"english_name": "Lebanese Pound"
		},
		{
			"isCommon": false,
			"default_locale": "ar_LY",
			"iso_code": "LYD",
			"english_name": "Libyan Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "lt_LT",
			"iso_code": "LTL",
			"english_name": "Lithuanian Litas"
		},
		{
			"isCommon": false,
			"default_locale": "zh_MO",
			"iso_code": "MOP",
			"english_name": "Macao Pataca"
		},
		{
			"isCommon": false,
			"default_locale": "mk_MK",
			"iso_code": "MKD",
			"english_name": "Macedonian Denar"
		},
		{
			"isCommon": false,
			"default_locale": "ms_MY",
			"iso_code": "MYR",
			"english_name": "Malaysian Ringgit"
		},
		{
			"isCommon": false,
			"default_locale": "mt_MT",
			"iso_code": "MTL",
			"english_name": "Maltese Lira"
		},
		{
			"isCommon": false,
			"default_locale": "fr_MU",
			"iso_code": "MUR",
			"english_name": "Mauritian Rupee"
		},
		{
			"isCommon": false,
			"default_locale": "es_MX",
			"iso_code": "MXN",
			"english_name": "Mexican Peso"
		},
		{
			"isCommon": false,
			"default_locale": "ar_MA",
			"iso_code": "MAD",
			"english_name": "Moroccan Dirham"
		},
		{
			"isCommon": false,
			"default_locale": "nl_AN",
			"iso_code": "ANG",
			"english_name": "Netherlands Antillean Gulden"
		},
		{
			"isCommon": false,
			"default_locale": "zh_TW",
			"iso_code": "TWD",
			"english_name": "New Taiwan Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "en_NZ",
			"iso_code": "NZD",
			"english_name": "New Zealand Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "es_NI",
			"iso_code": "NIO",
			"english_name": "Nicaraguan Cordoba Oro"
		},
		{
			"isCommon": false,
			"default_locale": "en_NG",
			"iso_code": "NGN",
			"english_name": "Nigerian Naira"
		},
		{
			"isCommon": false,
			"default_locale": "nb_NO",
			"iso_code": "NOK",
			"english_name": "Norwegian Krone"
		},
		{
			"isCommon": false,
			"default_locale": "ur_PK",
			"iso_code": "PKR",
			"english_name": "Pakistan Rupee"
		},
		{
			"isCommon": false,
			"default_locale": "es_PA",
			"iso_code": "PAB",
			"english_name": "Panamanian Balboa"
		},
		{
			"isCommon": false,
			"default_locale": "es_PY",
			"iso_code": "PYG",
			"english_name": "Paraguay Guarani"
		},
		{
			"isCommon": false,
			"default_locale": "quz_PE",
			"iso_code": "PEN",
			"english_name": "Peruvian Nuevo Sol"
		},
		{
			"isCommon": false,
			"default_locale": "es_UY",
			"iso_code": "UYU",
			"english_name": "Peso Uruguayo"
		},
		{
			"isCommon": false,
			"default_locale": "en_PH",
			"iso_code": "PHP",
			"english_name": "Philippine Peso"
		},
		{
			"isCommon": false,
			"default_locale": "pl_PL",
			"iso_code": "PLN",
			"english_name": "Polish Zloty"
		},
		{
			"isCommon": false,
			"default_locale": "zh_CN",
			"iso_code": "CNY",
			"english_name": "PRC Yuan Renminbi"
		},
		{
			"isCommon": false,
			"default_locale": "ar_QA",
			"iso_code": "QAR",
			"english_name": "Qatari Rial"
		},
		{
			"isCommon": false,
			"default_locale": "pt_BR",
			"iso_code": "BRL",
			"english_name": "Real"
		},
		{
			"isCommon": false,
			"default_locale": "ar_OM",
			"iso_code": "OMR",
			"english_name": "Rial Omani"
		},
		{
			"isCommon": false,
			"default_locale": "ro_RO",
			"iso_code": "RON",
			"english_name": "Romanian Leu"
		},
		{
			"isCommon": false,
			"default_locale": "dv_MV",
			"iso_code": "MVR",
			"english_name": "Rufiyaa"
		},
		{
			"isCommon": false,
			"default_locale": "tt_RU",
			"iso_code": "RUR",
			"english_name": "Russian Ruble"
		},
		{
			"isCommon": false,
			"default_locale": "ru_RU",
			"iso_code": "RUB",
			"english_name": "Russian Ruble"
		},
		{
			"isCommon": false,
			"default_locale": "ar_SA",
			"iso_code": "SAR",
			"english_name": "Saudi Riyal"
		},
		{
			"isCommon": false,
			"default_locale": "sr_Cyrl_CS",
			"iso_code": "RSD",
			"english_name": "Serbian Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "zh_SG",
			"iso_code": "SGD",
			"english_name": "Singapore Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "sk_SK",
			"iso_code": "SKK",
			"english_name": "Slovak Koruna"
		},
		{
			"isCommon": false,
			"default_locale": "sl_SI",
			"iso_code": "SIT",
			"english_name": "Slovenian Tolar"
		},
		{
			"isCommon": false,
			"default_locale": "ky_KG",
			"iso_code": "KGS",
			"english_name": "som"
		},
		{
			"isCommon": false,
			"default_locale": "en_ZA",
			"iso_code": "ZAR",
			"english_name": "South African Rand"
		},
		{
			"isCommon": false,
			"default_locale": "en_LK",
			"iso_code": "LKR",
			"english_name": "Sri Lankan Rupee"
		},
		{
			"isCommon": false,
			"default_locale": "smj_SE",
			"iso_code": "SEK",
			"english_name": "Swedish Krona"
		},
		{
			"isCommon": false,
			"default_locale": "fr_CH",
			"iso_code": "CHF",
			"english_name": "Swiss Franc"
		},
		{
			"isCommon": false,
			"default_locale": "ar_SY",
			"iso_code": "SYP",
			"english_name": "Syrian Pound"
		},
		{
			"isCommon": false,
			"default_locale": "th_TH",
			"iso_code": "THB",
			"english_name": "Thai Baht"
		},
		{
			"isCommon": false,
			"default_locale": "en_TT",
			"iso_code": "TTD",
			"english_name": "Trinidad Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "mn_MN",
			"iso_code": "MNT",
			"english_name": "Tugrik"
		},
		{
			"isCommon": false,
			"default_locale": "ar_TN",
			"iso_code": "TND",
			"english_name": "Tunisian Dinar"
		},
		{
			"isCommon": false,
			"default_locale": "tr_TR",
			"iso_code": "TRY",
			"english_name": "Turkish Lira"
		},
		{
			"isCommon": false,
			"default_locale": "ar_AE",
			"iso_code": "AED",
			"english_name": "UAE Dirham"
		},
		{
			"isCommon": false,
			"default_locale": "en_UG",
			"iso_code": "UGX",
			"english_name": "Ugandan Shilling"
		},
		{
			"isCommon": true,
			"default_locale": "en_GB",
			"iso_code": "GBP",
			"english_name": "UK Pound Sterling"
		},
		{
			"isCommon": false,
			"default_locale": "uk_UA",
			"iso_code": "UAH",
			"english_name": "Ukrainian Hryvnia"
		},
		{
			"isCommon": true,
			"default_locale": "en_US",
			"iso_code": "USD",
			"english_name": "US Dollar"
		},
		{
			"isCommon": false,
			"default_locale": "uz_Cyrl_UZ",
			"iso_code": "UZS",
			"english_name": "Uzbekistan Sum"
		},
		{
			"isCommon": false,
			"default_locale": "es_VE",
			"iso_code": "VEB",
			"english_name": "Venezuelan Bolivar"
		},
		{
			"isCommon": false,
			"default_locale": "vi_VN",
			"iso_code": "VND",
			"english_name": "Vietnamese Dong"
		},
		{
			"isCommon": false,
			"default_locale": "ar_YE",
			"iso_code": "YER",
			"english_name": "Yemeni Rial"
		},
		{
			"isCommon": false,
			"default_locale": "en_ZW",
			"iso_code": "ZWD",
			"english_name": "Zimbabwe Dollar"
		}
	];

	public static number_formats:INumberFormat[] = [
		{
			"decimal_digits": 2,
			"decimal_separator": ".",
			"example_format": "123,456.78",
			"group_separator": ","
		},
		{
			"decimal_digits": 2,
			"decimal_separator": ",",
			"example_format": "123.456,78",
			"group_separator": "."
		},
		{
			"decimal_digits": 3,
			"decimal_separator": ".",
			"example_format": "123,456.789",
			"group_separator": ","
		},
		{
			"decimal_digits": 2,
			"decimal_separator": ",",
			"example_format": "123 456,78",
			"group_separator": " "
		},
		{
			"decimal_digits": 2,
			"decimal_separator": ".",
			"example_format": "123 456.78",
			"group_separator": " "
		},
		{
			"decimal_digits": 2,
			"decimal_separator": ".",
			"example_format": "123'456.78",
			"group_separator": "'"
		},
		{
			"decimal_digits": 0,
			"decimal_separator": ",",
			"example_format": "123.456",
			"group_separator": "."
		},
		{
			"decimal_digits": 0,
			"decimal_separator": ".",
			"example_format": "123,456",
			"group_separator": ","
		},
		{
			"decimal_digits": 2,
			"decimal_separator": "-",
			"example_format": "123 456-78",
			"group_separator": " "
		},
		{
			"decimal_digits": 2,
			"decimal_separator": ",",
			"example_format": "123 456,78",
			"group_separator": " "
		},
		{
			"decimal_digits": 2,
			"decimal_separator": "/",
			"example_format": "123,456/78",
			"group_separator": ","
		},
		{
			"decimal_digits": 0,
			"decimal_separator": ",",
			"example_format": "123 456",
			"group_separator": " "
		}
	];

	public static date_formats:string[] = [
		"YYYY/MM/DD",
		"YYYY-MM-DD",
		"DD-MM-YYYY",
		"DD/MM/YYYY",
		"DD.MM.YYYY",
		"MM/DD/YYYY",
		"YYYY.MM.DD"
	];

	public static locale_mappings:SimpleObjectMap<IDataFormat> = {
		"moh_CA": {
			"iso_code": "CAD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"fr_BE": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"mr_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Rs",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"sq_AL": {
			"iso_code": "ALL",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "Lek",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"ms_BN": {
			"iso_code": "BND",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sr_Cyrl_BA": {
			"iso_code": "BAM",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "КМ",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"ms_MY": {
			"iso_code": "MYR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "RM",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fr_FR": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"mt_MT": {
			"iso_code": "MTL",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Lm",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sr_Latn_BA": {
			"iso_code": "BAM",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "KM",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"nb_NO": {
			"iso_code": "NOK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "kr ",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"sr_Latn_CS": {
			"iso_code": "RSD",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "Din.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"nl_AN": {
			"iso_code": "ANG",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "ƒ",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"fr_HT": {
			"iso_code": "HTG",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "G",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ar_OM": {
			"iso_code": "OMR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ر.ع.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sv_SE": {
			"iso_code": "SEK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"nl_NL": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"sw_KE": {
			"iso_code": "KES",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "S",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"nn_NO": {
			"iso_code": "NOK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"syr_SY": {
			"iso_code": "SYP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ل.س.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"nl_BE": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ns_ZA": {
			"iso_code": "ZAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "R",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"ta_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ரூ",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"ar_QA": {
			"iso_code": "QAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ر.ق.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"te_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "రూ",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"ar_SA": {
			"iso_code": "SAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ر.س.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sr_Cyrl_CS": {
			"iso_code": "RSD",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "Дин.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"ar_SY": {
			"iso_code": "SYP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ل.س.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"tn_ZA": {
			"iso_code": "ZAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "R",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"pa_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ਰੁ",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"ar_TN": {
			"iso_code": "TND",
			"example_format": "123,456.789",
			"decimal_digits": 3,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ت.‏",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"tr_TR": {
			"iso_code": "TRY",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": " TL",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"pl_PL": {
			"iso_code": "PLN",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "zł",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"ar_YE": {
			"iso_code": "YER",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ر.ي.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sv_FI": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"pt_BR": {
			"iso_code": "BRL",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "R$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"az_Cyrl_AZ": {
			"iso_code": "AZM",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "ман.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"uk_UA": {
			"iso_code": "UAH",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "грн.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"az_Latn_AZ": {
			"iso_code": "AZM",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "man.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"ur_PK": {
			"iso_code": "PKR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Rs",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"pt_PT": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"be_BY": {
			"iso_code": "BYR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "р.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"uz_Cyrl_UZ": {
			"iso_code": "UZS",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "сўм",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"quz_BO": {
			"iso_code": "BOB",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$b",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"bg_BG": {
			"iso_code": "BGL",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "лв",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"uz_Latn_UZ": {
			"iso_code": "UZS",
			"example_format": "123 456",
			"decimal_digits": 0,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "su'm",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"bn_BD": {
			"iso_code": "BDT",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "৳ ",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"vi_VN": {
			"iso_code": "VND",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "₫",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"quz_EC": {
			"iso_code": "USD",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"bs_Cyrl_BA": {
			"iso_code": "BAM",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "КМ",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"th_TH": {
			"iso_code": "THB",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "฿",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"quz_PE": {
			"iso_code": "PEN",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "S/.",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"bs_Latn_BA": {
			"iso_code": "BAM",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "KM",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"zh_CN": {
			"iso_code": "CNY",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "￥",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"ca_ES": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"zh_HK": {
			"iso_code": "HKD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "HK$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"rm_CH": {
			"iso_code": "CHF",
			"example_format": "123'456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": "'",
			"currency_symbol": "fr.",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"cs_CZ": {
			"iso_code": "CZK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "Kč",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"zh_MO": {
			"iso_code": "MOP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "MOP",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ro_RO": {
			"iso_code": "RON",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "lei",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"cy_GB": {
			"iso_code": "GBP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "£",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"zh_SG": {
			"iso_code": "SGD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"da_DK": {
			"iso_code": "DKK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"zh_TW": {
			"iso_code": "TWD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "NT$",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"ru_RU": {
			"iso_code": "RUB",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "р.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"de_AT": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"zu_ZA": {
			"iso_code": "ZAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "R",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"de_CH": {
			"iso_code": "CHF",
			"example_format": "123'456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": "'",
			"currency_symbol": "SFr.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"en_US": {
			"iso_code": "USD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"de_DE": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"de_LI": {
			"iso_code": "CHF",
			"example_format": "123'456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": "'",
			"currency_symbol": "CHF ",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"xh_ZA": {
			"iso_code": "ZAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "R",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"de_LU": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"sa_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Rs",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"dv_MV": {
			"iso_code": "MVR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "ރ.",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"el_GR": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_029": {
			"iso_code": "USD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"se_FI": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"en_AU": {
			"iso_code": "AUD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_BZ": {
			"iso_code": "BZD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "BZ$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"tt_RU": {
			"iso_code": "RUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "р.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"en_CA": {
			"iso_code": "CAD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_GB": {
			"iso_code": "GBP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "£",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fr_LU": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_GH": {
			"iso_code": "GHS",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "₵",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fr_MC": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"se_NO": {
			"iso_code": "NOK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"en_IE": {
			"iso_code": "EUR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_JM": {
			"iso_code": "JMD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "J$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"se_SE": {
			"iso_code": "SEK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"en_LK": {
			"iso_code": "LKR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "Rs",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fr_MU": {
			"iso_code": "MUR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Rs ",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sk_SK": {
			"iso_code": "SKK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "Sk",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"en_NG": {
			"iso_code": "NGN",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "₦",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fr_PF": {
			"iso_code": "XPF",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "Fr",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_NZ": {
			"iso_code": "NZD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fy_NL": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"en_PH": {
			"iso_code": "PHP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Php",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"en_TT": {
			"iso_code": "TTD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "TT$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ga_IE": {
			"iso_code": "EUR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_UG": {
			"iso_code": "UGX",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "USh",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"gl_ES": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"en_ZA": {
			"iso_code": "ZAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "R",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"gu_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": " ₹",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"en_ZW": {
			"iso_code": "ZWD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Z$",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"es_AR": {
			"iso_code": "ARS",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"he_IL": {
			"iso_code": "ILS",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "₪",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"sl_SI": {
			"iso_code": "SIT",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "SIT",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"es_BO": {
			"iso_code": "BOB",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$b",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"hi_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Rs",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"es_CL": {
			"iso_code": "CLP",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"hr_BA": {
			"iso_code": "BAM",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "KM",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"sma_NO": {
			"iso_code": "NOK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"es_CR": {
			"iso_code": "CRC",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "₡",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"hr_HR": {
			"iso_code": "HRK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "kn",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"es_EC": {
			"iso_code": "USD",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"hu_HU": {
			"iso_code": "HUF",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": " Ft",
			"display_symbol" : true,
			"date_format": "YYYY.MM.DD"
		},
		"es_CO": {
			"iso_code": "COP",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_ES": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"hy_AM": {
			"iso_code": "AMD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": ",",
			"currency_symbol": "դր.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"sma_SE": {
			"iso_code": "SEK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"smj_NO": {
			"iso_code": "NOK",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"id_ID": {
			"iso_code": "IDR",
			"example_format": "123.456",
			"decimal_digits": 0,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "Rp",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_HN": {
			"iso_code": "HNL",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "L.",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"is_IS": {
			"iso_code": "ISK",
			"example_format": "123.456",
			"decimal_digits": 0,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "kr.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"es_DO": {
			"iso_code": "DOP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "RD$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_MX": {
			"iso_code": "MXN",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"it_CH": {
			"iso_code": "CHF",
			"example_format": "123'456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": "'",
			"currency_symbol": "SFr.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"es_GT": {
			"iso_code": "GTQ",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Q",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_PA": {
			"iso_code": "PAB",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "B/.",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"es_NI": {
			"iso_code": "NIO",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "C$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"af_ZA": {
			"iso_code": "ZAR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "R",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"iu_Latn_CA": {
			"iso_code": "CAD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_PE": {
			"iso_code": "PEN",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "S/.",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ar_AE": {
			"iso_code": "AED",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"it_IT": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ar_BH": {
			"iso_code": "BHD",
			"example_format": "123,456.789",
			"decimal_digits": 3,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ب.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"arn_CL": {
			"iso_code": "CLP",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"ar_DZ": {
			"iso_code": "DZD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ج.‏",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"es_PY": {
			"iso_code": "PYG",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "Gs",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ar_EG": {
			"iso_code": "EGP",
			"example_format": "123,456.789",
			"decimal_digits": 3,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ج.م.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_PR": {
			"iso_code": "USD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_SV": {
			"iso_code": "USD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ka_GE": {
			"iso_code": "GEL",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "Lari",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"kk_KZ": {
			"iso_code": "KZT",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "₸",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"ja_JP": {
			"iso_code": "JPY",
			"example_format": "123,456",
			"decimal_digits": 0,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "¥",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"ar_IQ": {
			"iso_code": "IQD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ع.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"kn_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ರೂ",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"ar_JO": {
			"iso_code": "JOD",
			"example_format": "123,456.789",
			"decimal_digits": 3,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ا.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"es_UY": {
			"iso_code": "UYU",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "$U",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"et_EE": {
			"iso_code": "EEK",
			"example_format": "123 456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"ko_KR": {
			"iso_code": "KRW",
			"example_format": "123,456",
			"decimal_digits": 0,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "₩",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"es_VE": {
			"iso_code": "VEB",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "Bs",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"eu_ES": {
			"iso_code": "EUR",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "YYYY/MM/DD"
		},
		"kok_IN": {
			"iso_code": "INR",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "Rs",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"ar_KW": {
			"iso_code": "KWD",
			"example_format": "123,456.789",
			"decimal_digits": 3,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ك.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fa_IR": {
			"iso_code": "IRR",
			"example_format": "123,456/78",
			"decimal_digits": 2,
			"decimal_separator": "/",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ريال",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"lb_LU": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ar_LB": {
			"iso_code": "LBP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "ل.ل.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"smj_SE": {
			"iso_code": "SEK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"ky_KG": {
			"iso_code": "KGS",
			"example_format": "123 456-78",
			"decimal_digits": 2,
			"decimal_separator": "-",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "сом",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"ar_LY": {
			"iso_code": "LYD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.ل.‏",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"fr_CH": {
			"iso_code": "CHF",
			"example_format": "123'456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": "'",
			"currency_symbol": "SFr.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"fil_PH": {
			"iso_code": "PHP",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "PhP",
			"display_symbol" : true,
			"date_format": "MM/DD/YYYY"
		},
		"lt_LT": {
			"iso_code": "LTL",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "Lt",
			"display_symbol" : true,
			"date_format": "YYYY.MM.DD"
		},
		"smn_FI": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"lv_LV": {
			"iso_code": "LVL",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": " ",
			"currency_symbol": "Ls",
			"display_symbol" : true,
			"date_format": "YYYY.MM.DD"
		},
		"fi_FI": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"fo_FO": {
			"iso_code": "DKK",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": true,
			"group_separator": ".",
			"currency_symbol": "kr",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"mi_NZ": {
			"iso_code": "NZD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "DD/MM/YYYY"
		},
		"ar_MA": {
			"iso_code": "MAD",
			"example_format": "123,456.78",
			"decimal_digits": 2,
			"decimal_separator": ".",
			"symbol_first": true,
			"group_separator": ",",
			"currency_symbol": "د.م.‏",
			"display_symbol" : true,
			"date_format": "DD-MM-YYYY"
		},
		"mk_MK": {
			"iso_code": "MKD",
			"example_format": "123.456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": ".",
			"currency_symbol": "ден.",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		},
		"fr_CA": {
			"iso_code": "CAD",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "$",
			"display_symbol" : true,
			"date_format": "YYYY-MM-DD"
		},
		"mn_MN": {
			"iso_code": "MNT",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "₮",
			"display_symbol" : true,
			"date_format": "YYYY.MM.DD"
		},
		"sms_FI": {
			"iso_code": "EUR",
			"example_format": "123 456,78",
			"decimal_digits": 2,
			"decimal_separator": ",",
			"symbol_first": false,
			"group_separator": " ",
			"currency_symbol": "€",
			"display_symbol" : true,
			"date_format": "DD.MM.YYYY"
		}
	}
}
