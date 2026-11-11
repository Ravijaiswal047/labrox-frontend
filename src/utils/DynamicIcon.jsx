import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";

const iconLibraryLoaders = {
  Ri: () => import("react-icons/ri"),
  Fa: () => import("react-icons/fa"),
  Md: () => import("react-icons/md"),
  Bs: () => import("react-icons/bs"),
  Fi: () => import("react-icons/fi"),
  Ai: () => import("react-icons/ai"),
  Bi: () => import("react-icons/bi"),
  Ci: () => import("react-icons/ci"),
  Gi: () => import("react-icons/gi"),
  Go: () => import("react-icons/go"),
  Hi: () => import("react-icons/hi"),
  Hi2: () => import("react-icons/hi2"),
  Io: () => import("react-icons/io"),
  Io5: () => import("react-icons/io5"),
  Lu: () => import("react-icons/lu"),
  Pi: () => import("react-icons/pi"),
  Tb: () => import("react-icons/tb"),
  Ti: () => import("react-icons/ti"),
  Si: () => import("react-icons/si"),
  Sl: () => import("react-icons/sl"),
  Wi: () => import("react-icons/wi"), 
  Cg: () => import("react-icons/cg"),
  Gr: () => import("react-icons/gr"),
  Fc: () => import("react-icons/fc"),
  Fa6: () => import("react-icons/fa6"),
  Vsc: () => import("react-icons/vsc"),
  Im: () => import("react-icons/im"),
};

const loadedLibraries = {};

const getLoader = (name) => {
  if (!name) return null;
  const three = name.slice(0, 3);
  if (iconLibraryLoaders[three]) return { prefix: three, loader: iconLibraryLoaders[three] };
  const two = name.slice(0, 2);
  if (iconLibraryLoaders[two]) return { prefix: two, loader: iconLibraryLoaders[two] };
  return null;
};

// export const DynamicIcon = ({ name, size = 16, color, style = {}, ...rest }) => {
//   const [IconComponent, setIconComponent] = useState(null);

//   useEffect(() => {
//     if (!name) return;
//     const result = getLoader(name);
//     if (!result) return;
//     const { prefix, loader } = result;

//     if (loadedLibraries[prefix]) {
//       setIconComponent(() => loadedLibraries[prefix][name] || null);
//       return;
//     }

//     loader().then((lib) => {
//       loadedLibraries[prefix] = lib;
//       setIconComponent(() => lib[name] || null);
//     });
//   }, [name]);

//   if (!IconComponent) return null;
//   return <IconComponent size={size} color={color} style={style} {...rest} />;
// };


export const DynamicIcon = ({ name, size = 16, color, style = {}, ...rest }) => {
  const [IconComponent, setIconComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      setLoading(false);
      return;
    }
    const result = getLoader(name);
    if (!result) {
      setLoading(false);
      return;
    }
    const { prefix, loader } = result;

    if (loadedLibraries[prefix]) {
      setIconComponent(() => loadedLibraries[prefix][name] || null);
      setLoading(false);
      return;
    }

    loader().then((lib) => {
      loadedLibraries[prefix] = lib;
      setIconComponent(() => lib[name] || null);
      setLoading(false);
    });
  }, [name]);

  if (loading) return null;
  
  const FinalIcon = IconComponent || FaHome;
  return <FinalIcon size={size} color={color} style={style} {...rest} />;
};