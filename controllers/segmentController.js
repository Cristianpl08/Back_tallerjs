const Segment = require('../models/Segment');
const Project = require('../models/Project');

/**
 * Obtener todos los segmentos
 */
async function getSegments(req, res) {
  try {
    console.log('📹 Obteniendo todos los segmentos');
    
    // Obtener todos los segmentos
    const segments = await Segment.findAll();
    
    console.log(`✅ Segmentos encontrados: ${segments.length}`);
    
    // Convertir a formato de respuesta
    const segmentsData = segments.map(segment => segment.toResponseDict());
    
    const response = {
      success: true,
      message: 'Segmentos obtenidos exitosamente',
      data: {
        segments: segmentsData,
        count: segmentsData.length
      }
    };
    
    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);
    
  } catch (error) {
    console.log('💥 Error al obtener segmentos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener segmentos'
    });
  }
}

/**
 * Obtener un segmento por ID
 */
async function getSegment(req, res) {
  try {
    const { segmentId } = req.params;
    console.log(`📹 Obteniendo segmento con ID: ${segmentId}`);
    
    // Buscar segmento
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      console.log(`❌ Segmento no encontrado: ${segmentId}`);
      return res.status(404).json({
        success: false,
        message: 'Segmento no encontrado'
      });
    }
    
    console.log(`✅ Segmento encontrado: ${segmentId}`);
    
    const response = {
      success: true,
      message: 'Segmento obtenido exitosamente',
      data: {
        segment: segment.toResponseDict()
      }
    };
    
    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);
    
  } catch (error) {
    console.log('💥 Error al obtener segmento:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener segmento'
    });
  }
}

/**
 * Obtener segmentos por proyecto
 */
async function getSegmentsByProject(req, res) {
  try {
    const { projectId } = req.params;
    console.log(`📹 Obteniendo segmentos del proyecto: ${projectId}`);
    console.log(`📋 Tipo de projectId: ${typeof projectId}`);
    
    // Validar projectId
    if (!projectId) {
      console.log('❌ projectId es null o vacío');
      return res.status(400).json({
        success: false,
        message: 'ID de proyecto requerido'
      });
    }
    
    console.log(`🔍 Verificando existencia del proyecto: ${projectId}`);
    const project = await Project.findById(projectId);
    if (!project) {
      console.log(`❌ Proyecto no encontrado: ${projectId}`);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }
    
    console.log(`✅ Proyecto encontrado: ${projectId}`);
    
    // Obtener segmentos del proyecto
    console.log(`🔍 Buscando segmentos para proyecto: ${projectId}`);
    const segments = await Segment.findByProject(projectId);
    
    console.log(`✅ Segmentos encontrados: ${segments.length}`);
    
    // Convertir a formato de respuesta
    console.log('🔄 Convirtiendo segmentos a formato de respuesta...');
    const segmentsData = [];
    for (let i = 0; i < segments.length; i++) {
      try {
        const segmentDict = segments[i].toResponseDict();
        segmentsData.push(segmentDict);
        console.log(`  ✅ Segmento ${i+1} convertido: ${segmentDict._id || 'sin_id'}`);
      } catch (error) {
        console.log(`  ❌ Error al convertir segmento ${i+1}: ${error.message}`);
      }
    }
    
    const response = {
      success: true,
      message: 'Segmentos obtenidos exitosamente',
      data: {
        segments: segmentsData,
        count: segmentsData.length,
        project_id: projectId
      }
    };
    
    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);
    
  } catch (error) {
    console.log('💥 Error al obtener segmentos del proyecto:', error.message);
    console.log('📋 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener segmentos del proyecto'
    });
  }
}

/**
 * Crear un nuevo segmento
 */
async function createSegment(req, res) {
  try {
    const { startTime, endTime, projectid, prosody, prosody2, description, Descriptions_prosody = [] } = req.body;
    
    console.log('📹 Creando nuevo segmento');
    console.log('📋 Datos recibidos:', {
      startTime,
      endTime,
      projectid,
      prosody,
      prosody2,
      description,
      descriptions_prosody: Descriptions_prosody
    });

    // Validar datos requeridos
    if (startTime === null || startTime === undefined || endTime === null || endTime === undefined || !projectid) {
      return res.status(400).json({
        success: false,
        message: 'startTime, endTime y projectid son requeridos'
      });
    }

    // Validar que los tiempos sean válidos
    if (startTime < 0 || endTime < 0) {
      return res.status(400).json({
        success: false,
        message: 'Los tiempos deben ser mayores o iguales a 0'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'El tiempo de inicio debe ser menor al tiempo de fin'
      });
    }

    // Verificar que el proyecto existe
    const project = await Project.findById(projectid);
    if (!project) {
      console.log(`❌ Proyecto no encontrado: ${projectid}`);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Crear nuevo segmento
    const segment = new Segment({
      startTime: startTime,
      endTime: endTime,
      projectid: projectid,
      prosody: prosody,
      prosody2: prosody2,
      description: description,
      descriptions_prosody: Descriptions_prosody
    });
    
    console.log('💾 Guardando segmento en la base de datos...');
    await segment.saveSegment();
    console.log('✅ Segmento guardado exitosamente:', {
      _id: segment._id.toString(),
      startTime: segment.startTime,
      endTime: segment.endTime,
      projectid: segment.projectid
    });

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Segmento creado exitosamente',
      data: {
        segment: segment.toResponseDict()
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.status(201).json(response);

  } catch (error) {
    console.log('💥 Error al crear segmento:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al crear segmento'
    });
  }
}

/**
 * Actualizar un segmento
 */
async function updateSegment(req, res) {
  try {
    const { segmentId } = req.params;
    const { startTime, endTime, prosody, prosody2, description, Descriptions_prosody } = req.body;
    
    console.log(`📹 Actualizando segmento con ID: ${segmentId}`);
    console.log('📋 Datos recibidos:', {
      startTime,
      endTime,
      prosody,
      prosody2,
      description,
      descriptions_prosody: Descriptions_prosody
    });

    // Buscar segmento
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      console.log(`❌ Segmento no encontrado: ${segmentId}`);
      return res.status(404).json({
        success: false,
        message: 'Segmento no encontrado'
      });
    }

    // Actualizar campos si se proporcionan
    if (startTime !== null && startTime !== undefined) {
      if (startTime < 0) {
        return res.status(400).json({
          success: false,
          message: 'El tiempo de inicio debe ser mayor o igual a 0'
        });
      }
      segment.startTime = startTime;
    }

    if (endTime !== null && endTime !== undefined) {
      if (endTime < 0) {
        return res.status(400).json({
          success: false,
          message: 'El tiempo de fin debe ser mayor o igual a 0'
        });
      }
      segment.endTime = endTime;
    }

    // Validar que los tiempos sean válidos juntos
    if (startTime !== null || endTime !== undefined) {
      if (segment.startTime >= segment.endTime) {
        return res.status(400).json({
          success: false,
          message: 'El tiempo de inicio debe ser menor al tiempo de fin'
        });
      }
    }

    if (prosody !== null && prosody !== undefined) {
      segment.prosody = prosody;
    }
    if (prosody2 !== null && prosody2 !== undefined) {
      segment.prosody2 = prosody2;
    }
    if (description !== null && description !== undefined) {
      segment.description = description;
    }
    if (Descriptions_prosody !== null && Descriptions_prosody !== undefined) {
      segment.descriptions_prosody = Descriptions_prosody;
    }
    
    console.log('💾 Guardando cambios en la base de datos...');
    await segment.saveSegment();
    console.log('✅ Segmento actualizado exitosamente:', {
      _id: segment._id.toString(),
      startTime: segment.startTime,
      endTime: segment.endTime
    });

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Segmento actualizado exitosamente',
      data: {
        segment: segment.toResponseDict()
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.log('💥 Error al actualizar segmento:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar segmento'
    });
  }
}

/**
 * Actualizar/agregar campo de descriptions_prosody para un usuario en un segmento
 */
async function updateDescriptionsProsody(req, res) {
  try {
    const { segmentId, userId, fieldName, fieldValue, timestamp } = req.body;

    if (!segmentId || !userId || !fieldName || !fieldValue || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segmento no encontrado'
      });
    }

    // Asegurar que descriptions_prosody sea un array
    if (!Array.isArray(segment.descriptions_prosody)) {
      segment.descriptions_prosody = [];
    }

    // Buscar si el usuario ya tiene entrada en descriptions_prosody
    let updated = false;
    for (const entry of segment.descriptions_prosody) {
      if (entry.user_id === userId) {
        entry[fieldName] = fieldValue;
        // Guardar timestamp por campo
        if (!entry.timestamps) {
          entry.timestamps = {};
        }
        entry.timestamps[fieldName] = timestamp;
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      // Crear nueva entrada para el usuario
      const newEntry = {
        user_id: userId,
        [fieldName]: fieldValue,
        timestamps: { [fieldName]: timestamp }
      };
      segment.descriptions_prosody.push(newEntry);
    }

    await segment.saveSegment();
    res.json({
      success: true,
      message: 'Campo actualizado exitosamente',
      data: { segment: segment.toResponseDict() }
    });
  } catch (error) {
    console.log('💥 Error en updateDescriptionsProsody:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar descriptions_prosody'
    });
  }
}

/**
 * Eliminar un segmento
 */
async function deleteSegment(req, res) {
  try {
    const { segmentId } = req.params;
    console.log(`📹 Eliminando segmento con ID: ${segmentId}`);

    // Buscar segmento
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      console.log(`❌ Segmento no encontrado: ${segmentId}`);
      return res.status(404).json({
        success: false,
        message: 'Segmento no encontrado'
      });
    }

    // Eliminar segmento
    console.log('🗑️ Eliminando segmento de la base de datos...');
    await segment.deleteSegment();
    console.log('✅ Segmento eliminado exitosamente:', segmentId);

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Segmento eliminado exitosamente',
      data: {
        segment_id: segmentId
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.log('💥 Error al eliminar segmento:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar segmento'
    });
  }
}

/**
 * Incrementar contador de vistas de un segmento
 */
async function incrementViews(req, res) {
  try {
    const { segmentId } = req.params;
    console.log(`📹 Incrementando vistas del segmento: ${segmentId}`);

    // Buscar segmento
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      console.log(`❌ Segmento no encontrado: ${segmentId}`);
      return res.status(404).json({
        success: false,
        message: 'Segmento no encontrado'
      });
    }

    // Incrementar vistas
    await segment.incrementViews();
    console.log(`✅ Vistas incrementadas: ${segment.views}`);

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Vistas incrementadas exitosamente',
      data: {
        segment_id: segmentId,
        views: segment.views
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.log('💥 Error al incrementar vistas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al incrementar vistas'
    });
  }
}

/**
 * Incrementar contador de likes de un segmento
 */
async function incrementLikes(req, res) {
  try {
    const { segmentId } = req.params;
    console.log(`📹 Incrementando likes del segmento: ${segmentId}`);

    // Buscar segmento
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      console.log(`❌ Segmento no encontrado: ${segmentId}`);
      return res.status(404).json({
        success: false,
        message: 'Segmento no encontrado'
      });
    }

    // Incrementar likes
    await segment.incrementLikes();
    console.log(`✅ Likes incrementados: ${segment.likes}`);

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Likes incrementados exitosamente',
      data: {
        segment_id: segmentId,
        likes: segment.likes
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.log('💥 Error al incrementar likes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al incrementar likes'
    });
  }
}

module.exports = {
  getSegments,
  getSegment,
  getSegmentsByProject,
  createSegment,
  updateSegment,
  deleteSegment,
  incrementViews,
  incrementLikes,
  updateDescriptionsProsody
}; 