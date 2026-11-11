import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import NextGenButton from '../nextgen/NextGenButton';
import {
    FaFileExcel,
    FaFilePdf,
    FaSearch,
    FaDownload,
    FaPlus,
    FaEdit,
    FaSave,
    FaTimes,
    FaCheck,
    FaUpload,
    FaPrint,
    FaFilter,
    FaSync,
    FaShare,
    FaCopy,
    FaEye,
    FaTable,
    FaFlag,
    FaPaperclip,
    FaHome,
    FaFileImage,
    FaUser,
    FaTrashAlt,
    FaClock,
    FaEnvelope,
    FaHistory,
    FaBars,
    FaPaperPlane,
    FaArrowLeft,
    FaArrowRight,
    FaFileAlt,
    FaHandPointer,
    FaMicrochip,
} from 'react-icons/fa';

import { TbBinaryTreeFilled } from "react-icons/tb";





const iconMap = {
    excel: FaFileExcel,
    pdf: FaFilePdf,
    search: FaSearch,
    download: FaDownload,
    add: FaPlus,
    edit: FaEdit,
    delete: FaTrashAlt,
    save: FaSave,
    cancel: FaTimes,
    check: FaCheck,
    upload: FaUpload,
    print: FaPrint,
    filter: FaFilter,
    refresh: FaSync,
    list: FaBars,
    pending: FaClock,
    share: FaShare,
    mail: FaEnvelope,
    copy: FaCopy,
    forword: FaArrowRight,
    back: FaArrowLeft,
    eye: FaEye,
    table: FaTable,
    page: FaFileAlt,
    flag: FaFlag,
    ip: FaHandPointer,
    paperclip: FaPaperclip,
    home: FaHome,
    history: FaHistory,
    image: FaFileImage,
    user: FaUser,
    send: FaPaperPlane,
    tree: TbBinaryTreeFilled,
    machine: FaMicrochip,
};

const variantClasses = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    secondary: 'btn-secondary',
    outline: 'btn-outline-primary',
};

export const CustomButton = ({
    text,
    icon,
    onClick,
    type = 'button',
    className = '',
    variant = 'primary',
    size = 'sm',
    disabled = false,
    loading = false,
    ...props
}) => {
    const Icon = icon ? iconMap[icon.toLowerCase()] : null;
    const [t] = useTranslation();
    const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

    if (uiMode === 'nextgen') {
        return (
            <NextGenButton
                text={text}
                icon={Icon && <Icon />}
                onClick={onClick}
                type={type}
                className={className}
                variant={variant}
                size={size}
                disabled={disabled}
                loading={loading}
                {...props}
            />
        );
    }

    const baseClass = `btn btn-${size} ${variantClasses[variant] || variantClasses.primary}`;

    return (
        <button
            type={type}
            className={`${baseClass} ${className} rounded ${text ? 'px-3' : ''}`}
            onClick={onClick}
            disabled={disabled || loading}
            title={text ? t(text) : ''}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    {t(text)}
                </>
            ) : (
                <>
                    {Icon && <Icon className={text ? 'mr-2' : ''} />}
                    {t(text)}
                </>
            )}
        </button>
    )
}


export const SaveButton = ({
    text,
    onClick,
    type = 'button',
    className = '',
    size = 'sm',
    disabled = false,
    loading = false,
    ...props
}) => {
    const Icon = iconMap.save;
    const [t] = useTranslation();
    const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

    if (uiMode === 'nextgen') {
        return (
            <NextGenButton
                text={text}
                icon={<Icon />}
                onClick={onClick}
                type={type}
                className={className}
                variant="primary"
                size={size}
                disabled={disabled}
                loading={loading}
                {...props}
            />
        );
    }

    return (
        <button
            type={type}
            className={`btn btn-${size} ${variantClasses.primary}  ${className} rounded px-3`}
            onClick={onClick}
            disabled={disabled}
            title={text ? t(text) : ''}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    {t(text)}
                </>
            ) : (
                <>
                    {Icon && <Icon className={text ? "mr-2" : ""} />}
                    {t(text)}
                </>
            )}
        </button>
    )
}

export const CancelButton = ({
    text,
    onClick,
    type = 'button',
    className = '',
    size = 'sm',
    disabled = false,
    loading = false,
    ...props
}) => {
    const Icon = iconMap.cancel;
    const [t] = useTranslation();
    const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

    if (uiMode === 'nextgen') {
        return (
            <NextGenButton
                text={text}
                icon={<Icon />}
                onClick={onClick}
                type={type}
                className={className}
                variant="secondary"
                size={size}
                disabled={disabled}
                loading={loading}
                {...props}
            />
        );
    }

    return (
        <button
            type={type}
            className={`btn btn-${size} ${variantClasses.secondary}  ${className} rounded px-3`}
            onClick={onClick}
            disabled={disabled}
            title={text ? t(text) : ''}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    {t(text)}
                </>
            ) : (
                <>
                    {Icon && <Icon className={text ? "mr-2" : ""} />}
                    {text && t(text)}
                </>
            )}
        </button>
    )
}

export const DeleteButton = ({
    text,
    onClick,
    type = 'button',
    className = '',
    size = 'sm',
    disabled = false,
    loading = false,
    ...props
}) => {
    const Icon = iconMap.delete;
    const [t] = useTranslation();
    const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

    if (uiMode === 'nextgen') {
        return (
            <NextGenButton
                text={text}
                icon={<Icon />}
                onClick={onClick}
                type={type}
                className={className}
                variant="danger"
                size={size}
                disabled={disabled}
                loading={loading}
                {...props}
            />
        );
    }

    return (
        <button
            type={type}
            className={`btn btn-${size} ${variantClasses.danger}  ${className} rounded px-3`}
            onClick={onClick}
            disabled={disabled}
            title={text ? t(text) : ''}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    {t(text)}
                </>
            ) : (
                <>
                    {Icon && <Icon className={text ? "mr-2" : ""} />}
                    {text && t(text)}
                </>
            )}
        </button>
    )
}

export const SearchButton = ({
    text,
    onClick,
    type = 'button',
    className = '',
    size = 'sm',
    disabled = false,
    loading = false,
    ...props
}) => {
    const Icon = iconMap.search;
    const [t] = useTranslation();
    const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

    if (uiMode === 'nextgen') {
        return (
            <NextGenButton
                text={text}
                icon={<Icon />}
                onClick={onClick}
                type={type}
                className={className}
                variant="primary"
                size={size}
                disabled={disabled}
                loading={loading}
                {...props}
            />
        );
    }

    return (
        <button
            type={type}
            className={`btn btn-${size} ${variantClasses.primary}  ${className} rounded px-3`}
            onClick={onClick}
            disabled={disabled}
            title={text ? t(text) : ''}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    {t(text)}
                </>
            ) : (
                <>
                    {Icon && <Icon className={text ? "mr-2" : ""} />}
                    {text && t(text)}
                </>
            )}
        </button>
    )
}

export const EditButton = ({
    text,
    onClick,
    type = 'button',
    className = '',
    size = 'sm',
    disabled = false,
    loading = false,
    ...props
}) => {
    const Icon = iconMap.edit;
    const [t] = useTranslation();
    const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

    if (uiMode === 'nextgen') {
        return (
            <NextGenButton
                text={text}
                icon={<Icon />}
                onClick={onClick}
                type={type}
                className={className}
                variant="info"
                size={size}
                disabled={disabled}
                loading={loading}
                {...props}
            />
        );
    }

    return (
        <button
            type={type}
            className={`btn btn-${size} ${variantClasses.info}  ${className} rounded px-3`}
            onClick={onClick}
            disabled={disabled}
            title={text ? t(text) : ''}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    {t(text)}
                </>
            ) : (
                <>
                    {Icon && <Icon className={text ? "mr-2" : ""} />}
                    {text && t(text)}
                </>
            )}
        </button>
    )
}